import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Sparkles, RefreshCw, List,
  Plus, Minus, Trash2, X, Check, ChevronRight, Search,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { callClaude, PROMPTS } from '../utils/claude';
import { safeParseJSON, formatPrice, timeAgo } from '../utils/helpers';
import { LoadingDots } from '../components/LoadingDots';
import { DeliveryBadge } from '../components/DeliveryBadge';
import { orders } from '../data/orders';
import { products, getProductById } from '../data/products';

// ── DAILY ESSENTIALS data ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'dairy', label: 'Dairy & Eggs', emoji: '🥛',
    bg: 'bg-blue-50', heroBg: 'bg-blue-500', textColor: 'text-blue-700',
    badge: 'Runs out tomorrow', badgeBg: 'bg-blue-100 text-blue-700',
    items: [
      { id: 'de_d1', name: 'Amul Taaza Milk 1L', brand: 'Amul', price: 68, mrp: 72, reason: 'Daily staple', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/391893a.jpg' },
      { id: 'de_d2', name: 'Amul Curd 400g', brand: 'Amul', price: 35, mrp: 40, reason: 'Breakfast must', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/493219a.jpg' },
      { id: 'de_d3', name: 'Eggs (6 pcs)', brand: 'Farm Fresh', price: 48, mrp: 54, reason: 'Used 2/day', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/474886a.jpg' },
      { id: 'de_d4', name: 'Amul Butter 100g', brand: 'Amul', price: 56, mrp: 62, reason: 'Goes with bread', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/16241a.jpg' },
    ],
  },
  {
    id: 'fruits', label: 'Fruits & Veggies', emoji: '🍌',
    bg: 'bg-green-50', heroBg: 'bg-green-500', textColor: 'text-green-700',
    badge: 'Freshness alert', badgeBg: 'bg-green-100 text-green-700',
    items: [
      { id: 'de_f1', name: 'Bananas (6 pcs)', brand: 'Fresh', price: 40, mrp: 50, reason: 'Ripen in 1–2 days', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/195a.jpg' },
      { id: 'de_f2', name: 'Tomato (500g)', brand: 'Fresh', price: 25, mrp: 32, reason: 'Daily cooking', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/192a.jpg' },
      { id: 'de_f3', name: 'Onion (500g)', brand: 'Fresh', price: 20, mrp: 28, reason: 'Used every meal', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/91a.jpg' },
      { id: 'de_f4', name: 'Spinach 250g', brand: 'Fresh', price: 30, mrp: 38, reason: 'Wilts quickly', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/176a.jpg' },
    ],
  },
  {
    id: 'grains', label: 'Grains & Staples', emoji: '🌾',
    bg: 'bg-amber-50', heroBg: 'bg-amber-500', textColor: 'text-amber-700',
    badge: 'Running low', badgeBg: 'bg-amber-100 text-amber-700',
    items: [
      { id: 'de_g1', name: 'Britannia Brown Bread', brand: 'Britannia', price: 45, mrp: 52, reason: 'Every 2 days', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/50792a.jpg' },
      { id: 'de_g2', name: 'Tata Salt 1kg', brand: 'Tata', price: 22, mrp: 25, reason: 'Kitchen essential', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/17881a.jpg' },
      { id: 'de_g3', name: 'Fortune Oil 500ml', brand: 'Fortune', price: 72, mrp: 85, reason: 'Low in bottle', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/10730a.jpg' },
      { id: 'de_g4', name: 'Maggi 2-min Noodles', brand: 'Maggi', price: 14, mrp: 16, reason: 'Quick meal backup', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/421568a.jpg' },
    ],
  },
  {
    id: 'beverages', label: 'Beverages', emoji: '☕',
    bg: 'bg-orange-50', heroBg: 'bg-orange-500', textColor: 'text-orange-700',
    badge: 'Stock up', badgeBg: 'bg-orange-100 text-orange-700',
    items: [
      { id: 'de_b1', name: 'Bru Instant Coffee 50g', brand: 'Bru', price: 89, mrp: 105, reason: 'Morning ritual', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/3862a.jpg' },
      { id: 'de_b2', name: 'Brooke Bond Tea 100g', brand: 'Brooke Bond', price: 55, mrp: 65, reason: 'Daily morning tea', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/41302a.jpg' },
      { id: 'de_b3', name: 'Bisleri Water 1L', brand: 'Bisleri', price: 20, mrp: 24, reason: 'Refill needed', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/2680a.jpg' },
      { id: 'de_b4', name: 'Tropicana Orange 1L', brand: 'Tropicana', price: 110, mrp: 130, reason: 'Morning routine', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/31756a.jpg' },
    ],
  },
];

const ALL_DE_ITEMS = CATEGORIES.flatMap(c => c.items);

// ── SMART REORDER fallback ────────────────────────────────────────────────────
const FALLBACK_PREDICTIONS = [
  { productName: 'Pampers Active Baby Diapers', reasoning: 'Ordered 3 times, likely running low', urgency: 'high', productId: 'p017' },
  { productName: 'Amul Taaza Milk 1L', reasoning: 'Weekly staple, 13 days since last order', urgency: 'high', productId: 'p010' },
  { productName: 'Aashirvaad Atta 5kg', reasoning: 'Monthly staple, due for replenishment', urgency: 'medium', productId: 'p009' },
  { productName: 'Colgate MaxFresh Toothpaste', reasoning: 'Last ordered 81 days ago', urgency: 'medium', productId: 'p029' },
];

const URGENCY_STYLES = {
  high:   { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-600 border-red-100' },
  medium: { bar: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-600 border-amber-100' },
  low:    { bar: 'bg-green-500',  badge: 'bg-green-50 text-green-600 border-green-100' },
};

// ── EMOJI PICKER ──────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['📋', '🛒', '🎉', '🏠', '💪', '👶', '🌿', '🎁', '🍽️', '✈️', '📚', '💊'];

// ─────────────────────────────────────────────────────────────────────────────
// TODAY TAB — Daily Essentials
// ─────────────────────────────────────────────────────────────────────────────
function TodayTab({ selectedIds, onToggle, quantities, onSetQty }) {
  const [openCat, setOpenCat] = useState(null);

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
        Tap a category to pick items
      </p>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(cat => {
          const count = cat.items.filter(i => selectedIds.has(i.id)).length;
          return (
            <button
              key={cat.id}
              onClick={() => setOpenCat(cat)}
              className={`${cat.bg} rounded-2xl p-3 flex flex-col gap-2 active:scale-[0.97] transition-all text-left border-2 ${
                count > 0 ? 'border-[#FF9900]' : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{cat.emoji}</span>
                {count > 0 && (
                  <span className="w-5 h-5 bg-[#FF9900] rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                    {count}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">{cat.label}</p>
                <span className={`inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${cat.badgeBg}`}>
                  {cat.badge}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">{cat.items.length} items</p>
            </button>
          );
        })}
      </div>

      {/* Category bottom sheet */}
      {openCat && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setOpenCat(null)}
        >
          <div
            className="max-w-sm w-full bg-white rounded-t-3xl overflow-y-auto animate-slide-up"
            style={{ maxHeight: 'calc(100vh - 56px - 16px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`${openCat.heroBg} px-4 pt-5 pb-4 rounded-t-3xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{openCat.emoji}</span>
                  <h2 className="text-white text-base font-extrabold">{openCat.label}</h2>
                </div>
                <button onClick={() => setOpenCat(null)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold">×</button>
              </div>
              <p className="text-white/70 text-xs mt-1 ml-9">
                {openCat.items.filter(i => selectedIds.has(i.id)).length} of {openCat.items.length} selected
              </p>
            </div>
            <div className="p-4 space-y-2 pb-8">
              {openCat.items.map(item => {
                const sel  = selectedIds.has(item.id);
                const disc = Math.round(((item.mrp - item.price) / item.mrp) * 100);
                const qty  = quantities?.[item.id] ?? 1;
                return (
                  <div
                    key={item.id}
                    className={`w-full rounded-2xl border p-3 flex items-center gap-3 transition-all ${
                      sel ? 'border-[#FF9900] bg-orange-50/30' : 'border-gray-100 bg-white'
                    }`}
                  >
                    {/* Tap image/text area to toggle selection */}
                    <button
                      onClick={() => onToggle(item.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.brand}</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">{item.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-extrabold text-gray-900">
                            {formatPrice(item.price * (sel ? qty : 1))}
                          </span>
                          <span className="text-xs text-gray-400 line-through">{formatPrice(item.mrp)}</span>
                          {disc > 0 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{disc}% off</span>}
                        </div>
                      </div>
                    </button>

                    {/* Right side: stepper if selected, plain + if not */}
                    {sel ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => onSetQty(item.id, qty - 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center active:scale-90 transition-all"
                        >
                          <Minus size={12} className="text-gray-600" />
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-5 text-center tabular-nums">{qty}</span>
                        <button
                          onClick={() => onSetQty(item.id, qty + 1)}
                          className="w-7 h-7 rounded-full bg-[#FF9900] flex items-center justify-center active:scale-90 transition-all"
                        >
                          <Plus size={12} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onToggle(item.id)}
                        className="w-7 h-7 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
                      >
                        <Plus size={13} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SOON TAB — Smart Reorder
// ─────────────────────────────────────────────────────────────────────────────
function SoonTab({ selectedIndices, onToggle, onToggleAll, predictions, loading, quantities, onSetQty }) {
  const enriched = predictions.map(p => {
    const product = p.productId ? getProductById(p.productId) : null;
    const matched = orders.find(o =>
      o.items.some(i => getProductById(i.productId)?.name?.toLowerCase().includes(p.productName?.split(' ')[0]?.toLowerCase()))
    );
    return { ...p, product, daysAgo: matched?.daysAgo };
  });

  const allSel = enriched.every((_, i) => selectedIndices.has(i));

  if (loading) return (
    <div className="px-4 pt-8">
      <LoadingDots message="Analysing your order history..." />
    </div>
  );

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
          {selectedIndices.size} of {enriched.length} selected
        </p>
        <button onClick={onToggleAll} className="text-xs text-[#FF9900] font-semibold">
          {allSel ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {enriched.map((item, i) => {
        const sel   = selectedIndices.has(i);
        const style = URGENCY_STYLES[item.urgency] ?? URGENCY_STYLES.medium;
        const qty   = quantities?.[i] ?? 1;
        return (
          <div
            key={i}
            className={`w-full bg-white rounded-2xl border shadow-sm p-4 transition-all relative overflow-hidden ${
              sel ? 'border-[#FF9900] bg-orange-50/20' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar} rounded-l-2xl`} />
            <div className="flex items-center gap-3 ml-2">
              {/* Tap image / text to toggle */}
              <button className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.98]" onClick={() => onToggle(i)}>
                {item.product?.image && (
                  <img src={item.product.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${style.badge}`}>
                      {item.urgency}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">{item.daysAgo ? `Last ordered ${timeAgo(item.daysAgo)}` : 'From history'}</p>
                  <p className="text-[10px] text-gray-500 italic mt-0.5">"{item.reasoning}"</p>
                  {item.product && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(item.product.price * qty)}
                      </span>
                      <DeliveryBadge mins={item.product.deliveryMins} />
                    </div>
                  )}
                </div>
              </button>

              {/* Stepper (selected) or plain + (unselected) */}
              {sel ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onSetQty(i, qty - 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Minus size={12} className="text-gray-600" />
                  </button>
                  <span className="text-sm font-bold text-gray-900 w-5 text-center tabular-nums">{qty}</span>
                  <button
                    onClick={() => onSetQty(i, qty + 1)}
                    className="w-7 h-7 rounded-full bg-[#FF9900] flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Plus size={12} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onToggle(i)}
                  className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center flex-shrink-0 active:scale-90"
                >
                  <Plus size={12} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MY LISTS TAB — fully user-created custom lists
// ─────────────────────────────────────────────────────────────────────────────
function MyListsTab({ lists, onAddList, onDeleteList, onAddItemToList, onRemoveItemFromList, onAddListToCart }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📋');
  const [openListId, setOpenListId] = useState(null);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [query, setQuery] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    onAddList({ name: newName.trim(), emoji: newEmoji });
    setNewName('');
    setNewEmoji('📋');
    setShowCreate(false);
  };

  const openList = openListId ? lists.find(l => l.id === openListId) : null;

  const filteredProducts = products.filter(p => {
    const q = query.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
  });

  // Item picker modal
  if (showItemPicker && openList) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
        onClick={() => setShowItemPicker(false)}
      >
        <div
          className="max-w-sm w-full bg-white rounded-t-3xl overflow-y-auto animate-slide-up"
          style={{ maxHeight: 'calc(100vh - 56px - 16px)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-4 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">Add items to {openList.emoji} {openList.name}</p>
              <button onClick={() => setShowItemPicker(false)} className="text-gray-400 p-1"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>
          <div className="p-4 space-y-2 pb-8">
            {filteredProducts.map(p => {
              const already = openList.items.some(i => i.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => { if (!already) { onAddItemToList(openList.id, p); } }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                    already ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100 active:scale-[0.98]'
                  }`}
                >
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.brand} · {formatPrice(p.price)}</p>
                  </div>
                  {already
                    ? <Check size={16} className="text-green-500 flex-shrink-0" />
                    : <Plus size={16} className="text-[#FF9900] flex-shrink-0" />
                  }
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Single list detail view
  if (openList) {
    const total = openList.items.reduce((s, i) => s + i.price, 0);
    return (
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setOpenListId(null)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-600"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-lg">{openList.emoji}</span>
          <p className="text-sm font-bold text-gray-900 flex-1">{openList.name}</p>
          <button
            onClick={() => setShowItemPicker(true)}
            className="flex items-center gap-1 text-xs text-[#FF9900] font-semibold active:opacity-70"
          >
            <Plus size={13} /> Add items
          </button>
        </div>

        {openList.items.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm font-semibold text-gray-700 mb-1">This list is empty</p>
            <p className="text-xs text-gray-400 mb-4">Tap "Add items" to fill it up</p>
            <button
              onClick={() => setShowItemPicker(true)}
              className="bg-[#FF9900] text-white rounded-full px-5 py-2.5 text-sm font-bold active:scale-95"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-2">{openList.items.length} items · {formatPrice(total)}</p>
            {openList.items.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.brand} · {formatPrice(item.price)}</p>
                </div>
                <button
                  onClick={() => onRemoveItemFromList(openList.id, item.id)}
                  className="text-gray-300 hover:text-red-400 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddListToCart(openList)}
              className="w-full mt-3 bg-[#FF9900] text-white rounded-full py-3 font-bold text-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              Add all to cart · {formatPrice(total)}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Lists overview
  return (
    <div className="px-4 pt-4 pb-4">
      {lists.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm font-bold text-gray-800 mb-1">No lists yet</p>
          <p className="text-xs text-gray-400 mb-5">Create a list for anything — groceries, parties, weekly needs</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#FF9900] text-white rounded-full px-6 py-2.5 text-sm font-bold active:scale-95"
          >
            Create your first list
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map(list => {
            const total = list.items.reduce((s, i) => s + i.price, 0);
            return (
              <button
                key={list.id}
                onClick={() => setOpenListId(list.id)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-xl">
                  {list.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{list.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {list.items.length > 0 ? `${list.items.length} items · ${formatPrice(total)}` : 'Empty list'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteList(list.id); }}
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-95"
                  >
                    <Trash2 size={12} className="text-gray-400" />
                  </button>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating create button */}
      {lists.length > 0 && (
        <button
          onClick={() => setShowCreate(true)}
          className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-400 flex items-center justify-center gap-2 active:bg-gray-50 transition-all"
        >
          <Plus size={16} /> New list
        </button>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div
            className="max-w-sm w-full bg-white rounded-t-3xl p-6 animate-slide-up"
            style={{ paddingBottom: 'calc(1.5rem + 56px)' }}
          >
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto -mt-2 mb-4" />
            <h3 className="text-base font-bold text-gray-900 mb-4">Create a new list</h3>

            {/* Emoji selector */}
            <p className="text-xs text-gray-400 font-semibold mb-2">Pick an emoji</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center active:scale-95 transition-all ${
                    newEmoji === e ? 'bg-[#FF9900]/15 border-2 border-[#FF9900]' : 'bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Name input */}
            <p className="text-xs text-gray-400 font-semibold mb-1.5">List name</p>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Party Snacks, Weekly Veggies..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9900] mb-4"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setShowCreate(false); setNewName(''); setNewEmoji('📋'); }}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-full bg-[#FF9900] text-white text-sm font-bold active:scale-95 disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — MyBasket
// ─────────────────────────────────────────────────────────────────────────────
export default function MyBasket() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, addItems } = useCart();

  // Default tab from navigation state (e.g. home card "See all →" on reorder)
  const initialTab = location.state?.tab ?? 'today';
  const [activeTab, setActiveTab] = useState(initialTab);

  // TODAY — selected item IDs + per-item quantities
  const [todaySelected, setTodaySelected] = useState(() => {
    const s = new Set();
    CATEGORIES.forEach(c => { if (c.items[0]) s.add(c.items[0].id); });
    return s;
  });
  const [todayQty, setTodayQty] = useState(() => {
    const q = {};
    CATEGORIES.forEach(c => { if (c.items[0]) q[c.items[0].id] = 1; });
    return q;
  });

  // SOON — AI predictions
  const [predictions, setPredictions] = useState(FALLBACK_PREDICTIONS);
  const [soonLoading, setSoonLoading] = useState(false);
  const soonLoadedRef = useRef(false);
  const [soonSelected, setSoonSelected] = useState(new Set([0, 1, 2, 3]));
  const [soonQty, setSoonQty] = useState({ 0: 1, 1: 1, 2: 1, 3: 1 });
  const [addedOne, setAddedOne] = useState(new Set());

  // MY LISTS
  const [lists, setLists] = useState([]);

  // Lazy-load Soon predictions when that tab is first opened
  useEffect(() => {
    if (activeTab !== 'soon' || soonLoadedRef.current) return;
    soonLoadedRef.current = true;
    (async () => {
      setSoonLoading(true);
      try {
        const summary = orders.map(o => ({
          date: o.date, daysAgo: o.daysAgo,
          items: o.items.map(i => ({ name: getProductById(i.productId)?.name, qty: i.qty })),
        }));
        const { systemPrompt, userMessage } = PROMPTS.smartReorder(summary);
        const raw = await callClaude(systemPrompt, userMessage);
        const parsed = safeParseJSON(raw);
        const preds = parsed?.predictions?.length ? parsed.predictions : FALLBACK_PREDICTIONS;
        setPredictions(preds);
        const sel = new Set(preds.map((_, i) => i));
        setSoonSelected(sel);
        const qInit = {};
        preds.forEach((_, i) => { qInit[i] = 1; });
        setSoonQty(qInit);
      } catch {
        const sel = new Set(FALLBACK_PREDICTIONS.map((_, i) => i));
        setSoonSelected(sel);
        const qInit = {};
        FALLBACK_PREDICTIONS.forEach((_, i) => { qInit[i] = 1; });
        setSoonQty(qInit);
      } finally {
        setSoonLoading(false);
      }
    })();
  }, [activeTab]);

  // Toggle helpers
  const toggleToday = useCallback((id) => {
    setTodaySelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // ensure a default qty when first selecting
        setTodayQty(q => ({ ...q, [id]: q[id] ?? 1 }));
      }
      return next;
    });
  }, []);

  const setTodayItemQty = useCallback((id, qty) => {
    if (qty <= 0) {
      // deselect when decremented to 0
      setTodaySelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      setTodayQty(q => { const n = { ...q }; delete n[id]; return n; });
    } else {
      setTodayQty(q => ({ ...q, [id]: qty }));
    }
  }, []);

  const toggleSoon = useCallback((i) => {
    setSoonSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  const toggleAllSoon = useCallback(() => {
    const allSel = predictions.every((_, i) => soonSelected.has(i));
    setSoonSelected(allSel ? new Set() : new Set(predictions.map((_, i) => i)));
  }, [predictions, soonSelected]);

  const setSoonItemQty = useCallback((i, qty) => {
    if (qty <= 0) {
      setSoonSelected(prev => { const n = new Set(prev); n.delete(i); return n; });
    } else {
      setSoonQty(q => ({ ...q, [i]: qty }));
      setSoonSelected(prev => new Set([...prev, i]));
    }
  }, []);

  // Lists mutations
  const addList = (data) => {
    setLists(prev => [...prev, { id: `list_${Date.now()}`, items: [], ...data }]);
  };
  const deleteList = (id) => setLists(prev => prev.filter(l => l.id !== id));
  const addItemToList = (listId, product) => {
    setLists(prev => prev.map(l =>
      l.id === listId && !l.items.some(i => i.id === product.id)
        ? { ...l, items: [...l.items, { id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image }] }
        : l
    ));
  };
  const removeItemFromList = (listId, itemId) => {
    setLists(prev => prev.map(l =>
      l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l
    ));
  };
  const addListToCart = (list) => {
    addItems(list.items.map(i => ({ ...i, qty: 1 })));
    navigate('/cart');
  };

  // CTA logic per tab
  const todayItems = ALL_DE_ITEMS.filter(i => todaySelected.has(i.id));
  const todayTotal = todayItems.reduce((s, i) => s + i.price * (todayQty[i.id] || 1), 0);

  const enrichedPreds = predictions.map((p, i) => ({ ...p, product: p.productId ? getProductById(p.productId) : null, idx: i }));
  const soonItems = enrichedPreds.filter(e => soonSelected.has(e.idx) && e.product);
  const soonTotal = soonItems.reduce((s, e) => s + e.product.price * (soonQty[e.idx] || 1), 0);

  const handleAddToCart = () => {
    if (activeTab === 'today') {
      addItems(todayItems.map(i => ({ ...i, qty: todayQty[i.id] || 1 })));
    } else if (activeTab === 'soon') {
      addItems(soonItems.map(e => ({ ...e.product, qty: soonQty[e.idx] || 1 })));
    }
    navigate('/cart');
  };

  const ctaCount = activeTab === 'today'
    ? todayItems.reduce((s, i) => s + (todayQty[i.id] || 1), 0)
    : activeTab === 'soon'
    ? soonItems.reduce((s, e) => s + (soonQty[e.idx] || 1), 0)
    : 0;
  const ctaTotal  = activeTab === 'today' ? todayTotal          : activeTab === 'soon' ? soonTotal        : 0;
  const showCTA   = (activeTab === 'today' && ctaCount > 0) || (activeTab === 'soon' && ctaCount > 0);

  const TABS = [
    { id: 'today', label: 'Today',    count: todaySelected.size, icon: <Sparkles size={13} /> },
    { id: 'soon',  label: 'Soon',     count: soonSelected.size,  icon: <RefreshCw size={13} /> },
    { id: 'lists', label: 'My Lists', count: lists.length,       icon: <List size={13} /> },
  ];

  return (
    <div className="max-w-sm mx-auto min-h-screen animate-fade-in pb-28" style={{ backgroundColor: '#F7F8FC' }}>
      {/* ── HEADER ────────────────────────────────────────── */}
      <div
        className="px-4 pt-10 pb-0 sticky top-0 z-30"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)' }}
      >
        <div className="flex items-center gap-3 pb-4">
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-white tracking-tight">My Basket</h1>
            <p className="text-white/50 text-[11px] mt-0.5">Your personalised replenishment hub</p>
          </div>
          <span className="bg-white/15 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={9} /> AI
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F7F8FC] text-gray-900'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-[#FF9900]' : ''}>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-[#FF9900] text-white' : 'bg-white/20 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────── */}
      {activeTab === 'today' && (
        <TodayTab selectedIds={todaySelected} onToggle={toggleToday} quantities={todayQty} onSetQty={setTodayItemQty} />
      )}
      {activeTab === 'soon' && (
        <SoonTab
          selectedIndices={soonSelected}
          onToggle={toggleSoon}
          onToggleAll={toggleAllSoon}
          predictions={predictions}
          loading={soonLoading}
          quantities={soonQty}
          onSetQty={setSoonItemQty}
          addedIds={addedOne}
          onAddOne={(product, i) => {
            addItem(product, soonQty[i] || 1);
            setAddedOne(prev => new Set([...prev, i]));
          }}
        />
      )}
      {activeTab === 'lists' && (
        <MyListsTab
          lists={lists}
          onAddList={addList}
          onDeleteList={deleteList}
          onAddItemToList={addItemToList}
          onRemoveItemFromList={removeItemFromList}
          onAddListToCart={addListToCart}
        />
      )}

      {/* ── STICKY CTA ────────────────────────────────────── */}
      {showCTA && (
        <div className="fixed bottom-14 left-0 right-0 z-30 px-4 pb-3 pt-3 bg-white border-t border-gray-100 shadow-xl">
          <div className="max-w-sm mx-auto">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#FF9900] text-white rounded-full py-3.5 font-bold text-sm active:scale-95 transition-all shadow-orange flex items-center justify-center gap-2"
            >
              <ShoppingCart size={17} />
              Add {ctaCount} item{ctaCount !== 1 ? 's' : ''} to cart · {formatPrice(ctaTotal)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


