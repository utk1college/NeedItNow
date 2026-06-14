import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';
import { orders } from '../data/orders';
import { products, getProductById } from '../data/products';
import { callClaude, PROMPTS } from '../utils/claude';
import { safeParseJSON, formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { LoadingDots } from '../components/LoadingDots';
import { MissionCard } from '../components/MissionCard';
import {
  analyzePurchasePatterns,
  buildMissionCart,
} from '../utils/missionEngine';

// Category → fallback name when AI fails
const CATEGORY_FALLBACKS = {
  grocery: { name: 'Grocery Refill', emoji: '🛒' },
  baby: { name: 'Baby Essentials', emoji: '👶' },
  personal_care: { name: 'Personal Care', emoji: '🪥' },
  cleaning: { name: 'Cleaning Bundle', emoji: '🧹' },
  health: { name: 'Health Essentials', emoji: '💊' },
  party: { name: 'Party Supplies', emoji: '🎉' },
  default: { name: 'My Mission', emoji: '🛍️' },
};

function getFallbackName(productIds) {
  // Pick the most common category in the mission
  const catCount = {};
  for (const pid of productIds) {
    const p = getProductById(pid);
    if (p?.category) catCount[p.category] = (catCount[p.category] || 0) + 1;
  }
  const dominantCat =
    Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'default';
  return CATEGORY_FALLBACKS[dominantCat] ?? CATEGORY_FALLBACKS.default;
}

export default function ShoppingMissions() {
  const navigate = useNavigate();
  const { addItems } = useCart();

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMissionId, setActiveMissionId] = useState(null);

  // Load and name missions on mount
  useEffect(() => {
    async function loadMissions() {
      setLoading(true);
      const rawMissions = analyzePurchasePatterns(orders, products);

      if (rawMissions.length === 0) {
        setMissions([]);
        setLoading(false);
        return;
      }

      // Call AI for each mission in parallel, with category fallback
      const named = await Promise.all(
        rawMissions.map(async (m) => {
          try {
            const productNames = m.productIds.map(
              (id) => getProductById(id)?.name ?? id
            );
            const { systemPrompt, userMessage } = PROMPTS.shoppingMissions(productNames);
            const raw = await callClaude(systemPrompt, userMessage);
            const parsed = safeParseJSON(raw);
            const { name, emoji } =
              parsed?.name && parsed?.emoji
                ? parsed
                : getFallbackName(m.productIds);
            return { ...m, name, emoji };
          } catch {
            const { name, emoji } = getFallbackName(m.productIds);
            return { ...m, name, emoji };
          }
        })
      );

      setMissions(named);
      setLoading(false);
    }

    loadMissions();
  }, []);

  // One-tap reorder
  const handleRefill = (mission) => {
    setActiveMissionId(mission.id);
    const resolvedItems = buildMissionCart(mission, products);
    addItems(resolvedItems);
    setTimeout(() => navigate('/cart'), 300);
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-[#F7F8FC] pb-24 animate-fade-in">
      {/* Header */}
      <div
        className="px-4 pt-10 pb-4 sticky top-0 z-50"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">Shopping Missions</h1>
              <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Target size={9} /> AI
              </span>
            </div>
            <p className="text-white/70 text-xs mt-0.5">Your recurring shopping patterns</p>
          </div>
        </div>
      </div>

      {/* ── MISSIONS CONTENT ─────────────────────────────────── */}
      <div className="px-4 pt-4 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingDots message="Detecting your patterns..." />
          </div>
        )}

        {/* Empty state */}
        {!loading && missions.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-semibold text-gray-800 mb-1">No missions yet</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Shop a few more times and we'll automatically detect your recurring patterns.
            </p>
          </div>
        )}

        {/* Mission cards */}
        {!loading &&
          missions.map((mission) => {
            const resolvedItems = buildMissionCart(mission, products);
            return (
              <MissionCard
                key={mission.id}
                mission={mission}
                onRefill={handleRefill}
                isLoading={activeMissionId === mission.id}
                resolvedItems={resolvedItems}
              />
            );
          })}

        {/* Mission total summary */}
        {!loading && missions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">
              All Missions Summary
            </p>
            {missions.map((m) => {
              const resolved = buildMissionCart(m, products);
              const total = resolved.reduce((s, i) => s + i.price * (i.qty || 1), 0);
              return (
                <div key={m.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{m.emoji}</span>
                    <p className="text-xs font-medium text-gray-700">{m.name}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900">{formatPrice(total)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
