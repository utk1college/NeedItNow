import { useNavigate } from 'react-router-dom';
import { Search, Camera, AlertCircle, ChevronRight, Sparkles, ArrowRight, CalendarDays, Target } from 'lucide-react';
import { orders } from '../data/orders';
import { getProductById, products } from '../data/products';
import { DeliveryBadge } from '../components/DeliveryBadge';
import { analyzePurchasePatterns } from '../utils/missionEngine';
import { CategoryBrowse } from '../components/CategoryBrowse';

// ── Shopping Missions Preview tile (home screen) ─────────────────────────────
function ShoppingMissionsPreview() {
  const navigate = useNavigate();

  // Run synchronously — no AI, just raw pattern analysis
  const rawMissions = analyzePurchasePatterns(orders, products);
  if (rawMissions.length === 0) return null;

  // Sort by soonest refill, take top 2
  const topMissions = [...rawMissions]
    .sort((a, b) => a.predictedDaysUntil - b.predictedDaysUntil)
    .slice(0, 2);

  const EMOJI_MAP = {
    grocery: '🛒',
    baby: '👶',
    personal_care: '🪥',
    cleaning: '🧹',
    health: '💊',
    party: '🎉',
  };

  const getMissionEmoji = (productIds) => {
    const catCount = {};
    for (const pid of productIds) {
      const p = getProductById(pid);
      if (p?.category) catCount[p.category] = (catCount[p.category] || 0) + 1;
    }
    const cat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    return EMOJI_MAP[cat] ?? '🛍️';
  };

  const getMissionLabel = (productIds) => {
    const catCount = {};
    for (const pid of productIds) {
      const p = getProductById(pid);
      if (p?.category) catCount[p.category] = (catCount[p.category] || 0) + 1;
    }
    const labels = {
      grocery: 'Grocery Refill',
      baby: 'Baby Essentials',
      personal_care: 'Personal Care',
      cleaning: 'Cleaning Bundle',
      health: 'Health Essentials',
      party: 'Party Supplies',
    };
    const cat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    return labels[cat] ?? 'Shopping Mission';
  };

  return (
    <button
      onClick={() => navigate('/shopping-missions')}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:scale-[0.98] transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
            <Target size={15} className="text-[#FF9900]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Shopping Missions</p>
            <p className="text-xs text-gray-400">Your recurring routines</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-orange-50 text-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">AI</span>
          <ChevronRight size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Mission rows */}
      <div className="space-y-2">
        {topMissions.map((m) => {
          const isDueNow = m.predictedDaysUntil === 0;
          const isDueSoon = m.predictedDaysUntil > 0 && m.predictedDaysUntil <= 3;
          const refillText = isDueNow
            ? 'Due Now'
            : m.predictedDaysUntil === 1
            ? 'Due tomorrow'
            : `Due in ${m.predictedDaysUntil} days`;

          return (
            <div
              key={m.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                isDueNow
                  ? 'bg-red-50'
                  : isDueSoon
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getMissionEmoji(m.productIds)}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {getMissionLabel(m.productIds)}
                  </p>
                  <p className="text-[10px] text-gray-400">{m.productIds.length} products</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold ${
                  isDueNow ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-gray-500'
                }`}
              >
                {refillText}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}

// ── Calendar Events row ───────────────────────────────────────────────────────
function CalendarCard() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/calendar-home')}
      className="w-full flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left active:scale-[0.98] transition-all"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <CalendarDays size={22} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">My Calendar</p>
        <p className="text-xs text-gray-400 mt-0.5">Manage occasions · Get prep suggestions</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
    </button>
  );
}

// ── Panic Button card ─────────────────────────────────────────────────────────
function PanicCard() {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 flex items-center justify-between shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <p className="text-white text-xs font-semibold uppercase tracking-wide">Emergency Mode</p>
        </div>
        <h3 className="text-white text-base font-bold mb-1">Need something urgently?</h3>
        <p className="text-red-100 text-xs">Order critical items in one tap</p>
      </div>
      <button
        onClick={() => navigate('/panic')}
        className="bg-white text-red-600 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all ml-3"
      >
        <AlertCircle size={14} />
        Emergency
      </button>
    </div>
  );
}

// ── Main HomeScreen ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-24 animate-fade-in" style={{ backgroundColor: '#F7F8FC' }}>

      {/* ── HERO HEADER — dark navy gradient ────────────────── */}
      <div
        className="sticky top-0 z-50 px-4 pt-10 pb-4"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 70%, #0F3460 100%)' }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest mb-0.5">Deliver to</p>
            <button className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-white">Koramangala, Bengaluru</p>
              <ChevronRight size={13} className="text-[#FF9900]" />
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <DeliveryBadge mins={12} />
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF9900] to-orange-500 flex items-center justify-center shadow-orange"
            >
              <span className="text-sm font-extrabold text-white">A</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/search')}
            className="flex-1 flex items-center gap-2.5 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 active:bg-white/20 transition-colors"
          >
            <Search size={15} className="text-white/50 flex-shrink-0" />
            <span className="text-sm text-white/50 font-medium">Search anything...</span>
          </button>
          <button
            onClick={() => navigate('/photo-to-cart')}
            className="bg-white/10 border border-white/15 rounded-2xl px-3 flex items-center justify-center active:scale-95 transition-all"
          >
            <Camera size={19} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE FEED ─────────────────────────────────── */}
      <div className="px-4 pt-4 space-y-4 pb-28" style={{ isolation: 'isolate' }}>

        {/* Emergency Mode — at the top for urgency */}
        <PanicCard />

        {/* Situation Checkout — star feature */}
        <button
          onClick={() => navigate('/situation')}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-all relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FF9900 0%, #FF6B00 100%)',
            boxShadow: '0 6px 24px rgba(255,153,0,0.35)',
          }}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-3 w-12 h-12 rounded-full bg-white/10" />
          <div className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
            <Sparkles size={17} className="text-white" />
          </div>
          <div className="flex-1 text-left relative z-10">
            <p className="text-white text-[15px] font-extrabold leading-tight tracking-tight">Situation Checkout</p>
            <p className="text-white/75 text-[11px] mt-0.5">Describe what's happening — AI builds your cart</p>
          </div>
          <ArrowRight size={17} className="text-white/70 flex-shrink-0 relative z-10" />
        </button>

        <CalendarCard />
        <ShoppingMissionsPreview />

        {/* ── BROWSE CATEGORIES ── */}
        <div className="flex items-center gap-3 -mx-4 px-4 -mt-1">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Browse</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <CategoryBrowse />

        {/* Footer brand */}
        <div className="flex items-center justify-center gap-2 pt-2 pb-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] text-gray-300 font-semibold tracking-widest uppercase">NeedItNow</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
