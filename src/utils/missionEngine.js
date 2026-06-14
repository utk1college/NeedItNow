/**
 * missionEngine.js — Pure utility module for Shopping Missions.
 * All functions are side-effect free and deterministic.
 */

import { getProductById } from '../data/products.js';

// ── predictNextRefill ─────────────────────────────────────────────────────────

export function predictNextRefill(missionOrders) {
  if (!missionOrders || missionOrders.length < 2) {
    const lastDaysAgo = missionOrders?.[0]?.daysAgo ?? 30;
    return {
      avgIntervalDays: 30,
      predictedDaysUntil: Math.max(0, 30 - lastDaysAgo),
    };
  }

  const sorted = [...missionOrders].sort((a, b) => a.daysAgo - b.daysAgo);
  const intervals = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i].daysAgo - sorted[i - 1].daysAgo);
  }

  const avg = Math.round(intervals.reduce((s, v) => s + v, 0) / intervals.length);
  const lastDaysAgo = sorted[0].daysAgo;

  return {
    avgIntervalDays: Math.max(1, avg),
    predictedDaysUntil: Math.max(0, avg - lastDaysAgo),
  };
}

// ── findSubstitute ────────────────────────────────────────────────────────────

export function findSubstitute(original, catalog) {
  const candidates = catalog.filter(
    (p) => p.id !== original.id && p.category === original.category && p.inStock
  );
  if (candidates.length === 0) return null;

  const priceMin = original.price * 0.8;
  const priceMax = original.price * 1.2;

  const scored = candidates.map((p) => ({
    product: p,
    score:
      (p.brand === original.brand ? 10 : 0) +
      (p.price >= priceMin && p.price <= priceMax ? 5 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].product;
}

// ── buildMissionCart ──────────────────────────────────────────────────────────

export function buildMissionCart(mission, products) {
  const seen = new Set();
  const resolved = [];

  for (const pid of mission.productIds) {
    const product = products.find((p) => p.id === pid);
    if (!product) continue;

    if (product.inStock) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        resolved.push({ ...product, qty: 1, isSubstitute: false });
      }
    } else {
      const sub = findSubstitute(product, products);
      if (sub && !seen.has(sub.id)) {
        seen.add(sub.id);
        resolved.push({ ...sub, qty: 1, isSubstitute: true, originalProductId: product.id });
      }
    }
  }

  return resolved;
}

// ── findBestMission ───────────────────────────────────────────────────────────

export function findBestMission(query, missions) {
  if (!missions || missions.length === 0) return null;

  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (tokens.length === 0) return null;

  const scored = missions.map((m) => {
    const productNames = (m.productIds || [])
      .map((id) => getProductById(id)?.name ?? '')
      .join(' ');
    const productCategories = (m.productIds || [])
      .map((id) => getProductById(id)?.category ?? '')
      .join(' ');

    const haystack = [m.name ?? '', productNames, productCategories].join(' ').toLowerCase();
    const score = tokens.filter((t) => haystack.includes(t)).length;
    return { mission: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  return best.score > 0 ? best.mission : null;
}

// ── analyzePurchasePatterns ───────────────────────────────────────────────────

/**
 * Detect shopping missions from order history.
 *
 * Strategy:
 *  1. Count how many orders each product appears in.
 *  2. Products appearing in ≥ 2 orders are "recurring".
 *  3. Group recurring products by category — each category group becomes a mission.
 *  4. For single-item category groups, find a companion from the same category
 *     that appeared in orders at least once.
 *  5. Compute refill interval and filter to 5–120 day cycles.
 */
export function analyzePurchasePatterns(orders, products) {
  if (!orders || orders.length === 0) return [];

  // Step 1: Frequency count
  const productOrderCount = {};
  for (const order of orders) {
    for (const item of order.items) {
      productOrderCount[item.productId] = (productOrderCount[item.productId] || 0) + 1;
    }
  }

  // Step 2: Recurring products (≥ 2 orders)
  const recurringIds = Object.entries(productOrderCount)
    .filter(([, count]) => count >= 2)
    .map(([pid]) => pid);

  if (recurringIds.length === 0) return [];

  // Step 3: Group by category
  const categoryGroups = {};
  for (const pid of recurringIds) {
    const product = products.find((p) => p.id === pid);
    if (!product) continue;
    if (!categoryGroups[product.category]) categoryGroups[product.category] = [];
    categoryGroups[product.category].push(pid);
  }

  const missions = [];

  for (const [, pids] of Object.entries(categoryGroups)) {
    let groupPids = [...pids];

    // Step 4: Ensure mission has ≥ 2 products
    if (groupPids.length < 2) {
      const singlePid = groupPids[0];
      const singleProduct = products.find((p) => p.id === singlePid);
      if (!singleProduct) continue;

      // Find any other ordered product in the same category (even if only ordered once)
      const companion = Object.keys(productOrderCount)
        .filter((pid) => {
          const p = products.find((pp) => pp.id === pid);
          return p && p.category === singleProduct.category && pid !== singlePid;
        })
        .sort((a, b) => (productOrderCount[b] || 0) - (productOrderCount[a] || 0))[0];

      if (!companion) continue;
      groupPids = [singlePid, companion];
    }

    groupPids = [...new Set(groupPids)];

    // Step 5: Compute interval from relevant orders
    const relevantOrders = orders
      .filter((o) => groupPids.some((pid) => o.items.some((i) => i.productId === pid)))
      .sort((a, b) => a.daysAgo - b.daysAgo);

    if (relevantOrders.length === 0) continue;

    const { avgIntervalDays, predictedDaysUntil } = predictNextRefill(relevantOrders);

    // Filter: 5–120 day refill cycles (broader range for small dataset)
    if (avgIntervalDays < 5 || avgIntervalDays > 120) continue;

    const lastOrderedDaysAgo = Math.min(...relevantOrders.map((o) => o.daysAgo));

    missions.push({
      id: `mission_${groupPids.sort()[0]}`,
      productIds: groupPids,
      orderDates: relevantOrders.map((o) => o.date),
      avgIntervalDays,
      lastOrderedDaysAgo,
      predictedDaysUntil,
    });
  }

  // Deduplicate identical product sets
  const seen = new Set();
  return missions.filter((m) => {
    const key = [...m.productIds].sort().join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
