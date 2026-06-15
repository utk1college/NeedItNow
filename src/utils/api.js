/**
 * API client — talks to the Lambda backend.
 *
 * Base URL comes from VITE_API_URL (can be the same Lambda URL as VITE_LLM_PROXY_URL
 * if Lambda handles all routes, or a separate API Gateway URL).
 *
 * All functions return { data, error }.
 * Never throws — callers always check error.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_LLM_PROXY_URL ?? "";

async function request(method, path, body) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body !== undefined) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();

    if (!res.ok) {
      return { data: null, error: data?.error ?? `HTTP ${res.status}` };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message ?? "Network error" };
  }
}

// ── Order API ─────────────────────────────────────────────────────────────────

/**
 * Save a completed order to DynamoDB.
 * @param {{ userId: string, items: object[], total: number, paymentMode: string, deliveryMins: number, address: string }} order
 */
export async function saveOrder(order) {
  return request("POST", "/order", order);
}

/**
 * Fetch all orders for a user from DynamoDB.
 * Falls back gracefully — callers should merge with local hardcoded orders if empty.
 * @param {string} userId
 */
export async function fetchOrders(userId) {
  return request("GET", `/orders/${userId}`, undefined);
}

// ── User API ──────────────────────────────────────────────────────────────────

/**
 * Fetch user profile from DynamoDB.
 * @param {string} userId
 */
export async function fetchUser(userId) {
  return request("GET", `/user/${userId}`, undefined);
}

/**
 * Create or update user profile in DynamoDB.
 * Call this after Cognito sign-up / sign-in.
 * @param {{ userId: string, name: string, email: string, phone?: string, address?: string }} profile
 */
export async function upsertUser(profile) {
  return request("POST", "/user", profile);
}
