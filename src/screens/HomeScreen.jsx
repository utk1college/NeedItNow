import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, AlertCircle, ChevronRight, Users, Zap, RefreshCw, CalendarDays, ArrowRight } from 'lucide-react';
import { calendarEvents } from '../data/calendarEvents';
import { orders } from '../data/orders';
import { getProductById } from '../data/products';

import { daysFromNowLabel } from '../utils/helpers';
import { DeliveryBadge } from '../components/DeliveryBadge';

// ── Situation Checkout entry ──────────────────────────────────────────────────
function SituationCard({ onSubmit }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    navigate('/situation-checkout', { state: { situation: value } });
  };

  const quickSituations = [
    'My kid has fever 🤒',
    'Guests coming in 1 hr 🏠',
    'Power cut essentials ⚡',
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
          <Zap size={16} className="text-[#FF9900]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Situation Checkout</p>
          <p className="text-xs text-gray-400">Tell us what's happening</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="What's happening right now?"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9900] transition-colors"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="bg-[#FF9900] disabled:opacity-40 text-white rounded-xl px-4 flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowRight size={18} />
        </button>
      </form>
      <div className="flex gap-2 flex-wrap">
        {quickSituations.map(s => (
          <button
            key={s}
            onClick={() => navigate('/situation-checkout', { state: { situation: s } })}
            className="bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full active:scale-95 transition-all hover:bg-orange-100"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Calendar Events row ───────────────────────────────────────────────────────
function CalendarRow() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900">Coming up</h2>
        </div>
        <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Calendar synced
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {calendarEvents.map(event => (
          <button
            key={event.id}
            onClick={() => navigate(`/calendar/${event.id}`)}
            className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 w-36 text-left active:scale-95 transition-all hover:border-orange-200"
          >
            <span className="text-2xl mb-2 block">{event.emoji}</span>
            <p className="text-xs font-semibold text-gray-900 leading-tight mb-1">{event.title}</p>
            <p className="text-[10px] text-[#FF9900] font-medium mb-2">{daysFromNowLabel(event.daysFromNow)}</p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
              See suggestions
              <ChevronRight size={10} />
            </div>
          </button>
        ))}
      </div>
    </div>
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

// ── Smart Re-order strip ──────────────────────────────────────────────────────
function ReorderStrip() {
  const navigate = useNavigate();
  // Derive top 2 frequent items from order history
  const freq = {};
  orders.forEach(o => o.items.forEach(i => {
    freq[i.productId] = (freq[i.productId] || 0) + i.qty;
  }));
  const top2 = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => getProductById(id))
    .filter(Boolean);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw size={15} className="text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900">Looks like you're running low</h2>
        </div>
        <button
          onClick={() => navigate('/smart-reorder')}
          className="text-[#FF9900] text-xs font-semibold active:opacity-70"
        >
          See all
        </button>
      </div>
      <div className="space-y-2">
        {top2.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
            <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
              <p className="text-xs text-gray-400">Ordered {orders.find(o => o.items.some(i => i.productId === p.id)) ? `${orders.find(o => o.items.some(i => i.productId === p.id)).daysAgo} days ago` : 'recently'}</p>
              <DeliveryBadge mins={p.deliveryMins} />
            </div>
            <button
              onClick={() => navigate('/smart-reorder')}
              className="bg-[#FF9900] text-white text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all flex-shrink-0"
            >
              Reorder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Group Cart card ───────────────────────────────────────────────────────────
function GroupCartCard() {
  const navigate = useNavigate();
  const members = [
    { initials: 'PR', color: '#7C3AED', name: 'Priya' },
    { initials: 'DA', color: '#1D8348', name: 'Dad' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
            <Users size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Shop together</p>
            <p className="text-xs text-gray-400">Start a group cart</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/group-cart')}
          className="bg-[#FF9900] text-white text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
        >
          + Invite
        </button>
      </div>
      <div className="flex items-center gap-2">
        {members.map(m => (
          <div key={m.initials} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: m.color }}
            >
              {m.initials}
            </div>
            <span className="text-xs text-gray-600 font-medium">{m.name}</span>
          </div>
        ))}
        <button
          onClick={() => navigate('/group-cart')}
          className="flex items-center gap-1 text-xs text-gray-400 font-medium ml-auto active:opacity-70"
        >
          View cart <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Main HomeScreen ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Deliver to</p>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
              Koramangala, Bengaluru
              <ChevronRight size={14} className="text-[#FF9900]" />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DeliveryBadge mins={12} />
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <span className="text-sm font-bold text-[#FF9900]">A</span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search Amazon Now..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => navigate('/photo-to-cart')}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 flex items-center justify-center active:scale-95 transition-all hover:border-[#FF9900]"
          >
            <Camera size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="px-4 pt-4 space-y-5">
        <CalendarRow />
        <PanicCard />
        <SituationCard />
        <ReorderStrip />
        <GroupCartCard />

        {/* Bottom spacer brand */}
        <div className="flex items-center justify-center gap-2 pt-2 pb-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-300 font-medium">amazon now</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
