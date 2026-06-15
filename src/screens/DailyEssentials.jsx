import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Sparkles, Check, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

// ── Category data with items ──────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'dairy',
    label: 'Dairy & Eggs',
    emoji: '🥛',
    bg: 'bg-blue-100',
    heroBg: 'bg-blue-500',
    textColor: 'text-blue-700',
    accent: '#3B82F6',
    badge: 'Runs out tomorrow',
    badgeBg: 'bg-blue-200 text-blue-800',
    items: [
      { id: 'de_d1', name: 'Amul Taaza Milk 1L', brand: 'Amul', price: 68, mrp: 72, reason: 'Daily staple', image: '/products/p010.jpg' },
      { id: 'de_d2', name: 'Amul Curd 400g', brand: 'Amul', price: 35, mrp: 40, reason: 'Breakfast must', image: '/products/p010.jpg' },
      { id: 'de_d3', name: 'Eggs (6 pcs)', brand: 'Farm Fresh', price: 48, mrp: 54, reason: 'Used 2/day', image: '/products/p009.jpg' },
      { id: 'de_d4', name: 'Amul Butter 100g', brand: 'Amul', price: 56, mrp: 62, reason: 'Goes with bread', image: '/products/p013.jpg' },
    ],
  },
  {
    id: 'fruits',
    label: 'Fruits & Veggies',
    emoji: '🍌',
    bg: 'bg-green-100',
    heroBg: 'bg-green-500',
    textColor: 'text-green-700',
    accent: '#22C55E',
    badge: 'Freshness alert',
    badgeBg: 'bg-green-200 text-green-800',
    items: [
      { id: 'de_f1', name: 'Bananas (6 pcs)', brand: 'Fresh', price: 40, mrp: 50, reason: 'Ripen in 1–2 days', image: '/products/p007.jpg' },
      { id: 'de_f2', name: 'Tomato (500g)', brand: 'Fresh', price: 25, mrp: 32, reason: 'Daily cooking', image: '/products/p015.jpg' },
      { id: 'de_f3', name: 'Onion (500g)', brand: 'Fresh', price: 20, mrp: 28, reason: 'Used every meal', image: '/products/p015.jpg' },
      { id: 'de_f4', name: 'Spinach 250g', brand: 'Fresh', price: 30, mrp: 38, reason: 'Wilts quickly', image: '/products/p007.jpg' },
    ],
  },
  {
    id: 'grains',
    label: 'Grains & Staples',
    emoji: '🌾',
    bg: 'bg-amber-100',
    heroBg: 'bg-amber-500',
    textColor: 'text-amber-700',
    accent: '#F59E0B',
    badge: 'Running low',
    badgeBg: 'bg-amber-200 text-amber-800',
    items: [
      { id: 'de_g1', name: 'Britannia Brown Bread', brand: 'Britannia', price: 45, mrp: 52, reason: 'Every 2 days', image: '/products/p013.jpg' },
      { id: 'de_g2', name: 'Tata Salt 1kg', brand: 'Tata', price: 22, mrp: 25, reason: 'Kitchen essential', image: '/products/p015.jpg' },
      { id: 'de_g3', name: 'Fortune Oil 500ml', brand: 'Fortune', price: 72, mrp: 85, reason: 'Low in bottle', image: '/products/p014.jpg' },
      { id: 'de_g4', name: 'Maggi 2-min Noodles', brand: 'Maggi', price: 14, mrp: 16, reason: 'Quick meal backup', image: '/products/p016.jpg' },
    ],
  },
  {
    id: 'beverages',
    label: 'Beverages',
    emoji: '☕',
    bg: 'bg-orange-100',
    heroBg: 'bg-orange-500',
    textColor: 'text-orange-700',
    accent: '#F97316',
    badge: 'Stock up',
    badgeBg: 'bg-orange-200 text-orange-800',
    items: [
      { id: 'de_b1', name: 'Bru Instant Coffee 50g', brand: 'Bru', price: 89, mrp: 105, reason: 'Morning ritual', image: '/products/p012.jpg' },
      { id: 'de_b2', name: 'Brooke Bond Tea 100g', brand: 'Brooke Bond', price: 55, mrp: 65, reason: 'Daily morning tea', image: '/products/p012.jpg' },
      { id: 'de_b3', name: 'Bisleri Water 1L', brand: 'Bisleri', price: 20, mrp: 24, reason: 'Refill needed', image: '/products/p012.jpg' },
      { id: 'de_b4', name: 'Tropicana Orange 1L', brand: 'Tropicana', price: 110, mrp: 130, reason: 'Morning routine', image: '/products/p007.jpg' },
    ],
  },
];

// ── Category modal (expanded view) ───────────────────────────────────────────
function CategoryModal({ category, selectedIds, onToggle, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="max-w-sm w-full bg-white rounded-t-3xl overflow-y-auto animate-slide-up"
        style={{ maxHeight: 'calc(100vh - 56px - 16px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className={`${category.heroBg} px-4 pt-5 pb-4 rounded-t-3xl`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category.emoji}</span>
              <h2 className="text-white text-lg font-extrabold">{category.label}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center active:scale-95 transition-all text-white text-lg font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-white/80 text-xs ml-9">
            {category.items.filter(i => selectedIds.has(i.id)).length} of {category.items.length} selected
          </p>
        </div>

        <div className="p-4 space-y-2 pb-24">
          {category.items.map(item => {
            const selected = selectedIds.has(item.id);
            const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={`w-full rounded-2xl border p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left ${
                  selected ? 'border-[#FF9900] bg-orange-50/40' : 'border-gray-100 bg-white'
                }`}
              >
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.brand}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{item.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-extrabold text-gray-900">{formatPrice(item.price)}</span>
                    <span className="text-xs text-gray-400 line-through">{formatPrice(item.mrp)}</span>
                    {discount > 0 && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{discount}% off</span>
                    )}
                  </div>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  selected ? 'bg-[#FF9900]' : 'border-2 border-gray-200 bg-white'
                }`}>
                  {selected
                    ? <Check size={14} className="text-white" />
                    : <Plus size={13} className="text-gray-400" />
                  }
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main DailyEssentials screen ───────────────────────────────────────────────
export default function DailyEssentials() {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [selectedIds, setSelectedIds] = useState(() => {
    // Pre-select the first item of each category by default
    const initial = new Set();
    CATEGORIES.forEach(cat => { if (cat.items[0]) initial.add(cat.items[0].id); });
    return initial;
  });
  const [openCategory, setOpenCategory] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const toggleItem = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allItems = CATEGORIES.flatMap(c => c.items);
  const selectedItems = allItems.filter(i => selectedIds.has(i.id));
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.price, 0);

  const handleAddToCart = () => {
    addItems(selectedItems.map(p => ({ ...p, qty: 1 })));
    setAddedToCart(true);
    setTimeout(() => navigate('/cart'), 600);
  };

  // Hero category = dairy (first one)
  const heroCategory = CATEGORIES[0];
  const heroFeaturedItem = heroCategory.items[0];
  const heroDiscount = Math.round(((heroFeaturedItem.mrp - heroFeaturedItem.price) / heroFeaturedItem.mrp) * 100);
  const gridCategories = CATEGORIES.slice(1); // remaining 3 for 2x2 grid (we use 3 cards arranged as a column)

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-[#EAF4FF] animate-fade-in pb-40">
      {/* Header — sticky with solid white bg and high z-index to always cover scroll content */}
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-30"
           style={{ backgroundColor: '#ffffff' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900">Daily Essentials</h1>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={9} /> AI
              </span>
            </div>
            <p className="text-xs text-gray-400">Items likely running out soon</p>
          </div>
          <div className="flex items-center justify-center bg-orange-50 rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-[#FF9900]">{selectedIds.size} selected</span>
          </div>
        </div>
      </div>

      {/* Title banner — normal flow, no extra top padding needed with sticky header */}
      <div className="px-4 pt-5 pb-2" style={{ isolation: 'isolate' }}>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">Tomorrow's</p>
        <p className="text-2xl font-extrabold text-[#FF9900] leading-tight">Must-Haves</p>
        <p className="text-xs text-gray-500 mt-1">Tap a category to pick items • AI predicts what you'll need</p>
      </div>

      {/* ── BENTO GRID — wrapped in isolate so inner z-index doesn't escape above sticky header */}
      <div className="px-4 pt-2" style={{ isolation: 'isolate' }}>
        <div className="flex gap-3 h-[380px]">

          {/* LEFT: Hero card (Dairy & Eggs) */}
          <button
            onClick={() => setOpenCategory(heroCategory)}
            className="flex-[1.1] bg-blue-500 rounded-3xl p-4 flex flex-col justify-between active:scale-[0.97] transition-all relative overflow-hidden shadow-lg"
          >
            {/* Background circles — use z-0 not z-10 so they don't escape */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute bottom-[-10px] left-[-10px] w-20 h-20 bg-white/10 rounded-full" />

            <div className="relative">
              <span className="text-3xl">{heroCategory.emoji}</span>
              <h2 className="text-white text-lg font-extrabold mt-2 leading-tight">{heroCategory.label}</h2>
              <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {heroCategory.badge}
              </span>
            </div>

            <div className="relative">
              <img
                src={heroFeaturedItem.image}
                alt={heroFeaturedItem.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3 shadow-md"
              />
              <div className="bg-white/20 rounded-xl p-2 text-center">
                <p className="text-white/80 text-[10px] line-through">{formatPrice(heroFeaturedItem.mrp)}</p>
                <p className="text-white text-lg font-extrabold">{formatPrice(heroFeaturedItem.price)}</p>
                {heroDiscount > 0 && (
                  <p className="text-yellow-300 text-[10px] font-bold">{heroDiscount}% off</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-white/70 text-[10px]">{heroCategory.items.length} items</p>
                <div className="flex -space-x-1">
                  {heroCategory.items.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className={`w-4 h-4 rounded-full border border-blue-400 ${selectedIds.has(item.id) ? 'bg-yellow-300' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* RIGHT: 3 smaller category cards stacked */}
          <div className="flex-1 flex flex-col gap-3">
            {gridCategories.map(cat => {
              const featured = cat.items[0];
              const discount = Math.round(((featured.mrp - featured.price) / featured.mrp) * 100);
              const selectedCount = cat.items.filter(i => selectedIds.has(i.id)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setOpenCategory(cat)}
                  className={`flex-1 ${cat.bg} rounded-2xl p-3 flex items-center justify-between active:scale-[0.97] transition-all relative overflow-hidden shadow-sm`}
                >
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-gray-800 leading-tight">{cat.label}</p>
                    <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cat.badgeBg}`}>
                      {cat.badge}
                    </span>
                    <p className="text-xs font-extrabold text-gray-900 mt-1">{formatPrice(featured.price)}</p>
                    {discount > 0 && (
                      <p className={`text-[10px] font-bold ${cat.textColor}`}>Up to {discount}% off</p>
                    )}
                  </div>
                  <div className="relative">
                    <img
                      src={featured.image}
                      alt={featured.name}
                      className="w-14 h-14 rounded-xl object-cover shadow-sm"
                    />
                    {selectedCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF9900] rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SELECTED ITEMS STRIP ──────────────────────────────────── */}
      {selectedItems.length > 0 && (
        <div className="px-4 pt-5" style={{ isolation: 'isolate' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-900">
              Selected Items
              <span className="ml-1.5 text-xs text-gray-400 font-normal">({selectedItems.length})</span>
            </p>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-400 active:opacity-70"
            >
              Clear all
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {selectedItems.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="flex-shrink-0 bg-white rounded-2xl border border-[#FF9900] p-2.5 flex flex-col items-center gap-1 w-20 active:scale-95 transition-all relative"
              >
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                <p className="text-[9px] font-semibold text-gray-900 text-center leading-tight line-clamp-2">{item.name}</p>
                <p className="text-[10px] font-bold text-[#FF9900]">{formatPrice(item.price)}</p>
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF9900] rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">✓</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ALL CATEGORIES ROW ───────────────────────────────────── */}
      <div className="px-4 pt-5" style={{ isolation: 'isolate' }}>
        <p className="text-sm font-bold text-gray-900 mb-3">All Categories</p>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map(cat => {
            const catSelected = cat.items.filter(i => selectedIds.has(i.id)).length;
            return (
              <button
                key={cat.id}
                onClick={() => setOpenCategory(cat)}
                className={`${cat.bg} rounded-2xl p-3 flex items-center gap-2.5 active:scale-[0.97] transition-all text-left border-2 ${
                  catSelected > 0 ? 'border-[#FF9900]' : 'border-transparent'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{cat.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{cat.items.length} items</p>
                  {catSelected > 0 && (
                    <p className="text-[10px] font-bold text-[#FF9900]">{catSelected} selected</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM CTA ───────────────────────────────────────────── */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-30 px-4 pb-3 pt-3 bg-white border-t border-gray-100 shadow-xl">
          <div className="max-w-sm mx-auto">
            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`w-full rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${
                addedToCart ? 'bg-green-500 text-white' : 'bg-[#FF9900] text-white'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check size={18} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add {selectedItems.length} Items · {formatPrice(selectedTotal)}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── CATEGORY MODAL ───────────────────────────────────────── */}
      {openCategory && (
        <CategoryModal
          category={openCategory}
          selectedIds={selectedIds}
          onToggle={toggleItem}
          onClose={() => setOpenCategory(null)}
        />
      )}
    </div>
  );
}

