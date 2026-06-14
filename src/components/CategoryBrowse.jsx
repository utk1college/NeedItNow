import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

// ── Section definitions ────────────────────────────────────────────────────────
const BROWSE_SECTIONS = [
  {
    id: 'snacks',
    label: 'Snacks & Drinks',
    emoji: '🍿',
    categories: [
      { id: 'chips',    label: 'Chips & Namkeen',   bg: '#FFFBEB', productIds: ['p011', 'p028'] },
      { id: 'sweets',   label: 'Sweets & Choc',      bg: '#FDF2F8', productIds: ['p013'] },
      { id: 'drinks',   label: 'Drinks & Juices',    bg: '#FFF7ED', productIds: ['p012'] },
      { id: 'tea',      label: 'Tea & Coffee',       bg: '#FFFBEB', productIds: ['p010'] },
      { id: 'instant',  label: 'Instant Food',       bg: '#FEF2F2', productIds: ['p016'] },
      { id: 'biscuits', label: 'Biscuits & Cookies', bg: '#F5F5F4', productIds: ['p013'] },
      { id: 'chips2',   label: 'Party Snacks',       bg: '#FFF7ED', productIds: ['p028'] },
      { id: 'drinks2',  label: 'Soft Drinks',        bg: '#ECFDF5', productIds: ['p012'] },
    ],
  },
  {
    id: 'grocery',
    label: 'Grocery & Staples',
    emoji: '🛒',
    categories: [
      { id: 'atta',    label: 'Atta & Flour',   bg: '#F0FDF4', productIds: ['p009'] },
      { id: 'oil',     label: 'Oils & Ghee',    bg: '#FFFBEB', productIds: ['p014'] },
      { id: 'salt',    label: 'Salt & Spices',  bg: '#EFF6FF', productIds: ['p015'] },
      { id: 'dairy',   label: 'Dairy & Eggs',   bg: '#F0F9FF', productIds: ['p010'] },
      { id: 'noodles', label: 'Noodles & Pasta',bg: '#FEF2F2', productIds: ['p016'] },
      { id: 'snacks3', label: 'Snacks',         bg: '#FFF7ED', productIds: ['p011'] },
    ],
  },
  {
    id: 'personal',
    label: 'Beauty & Personal Care',
    emoji: '✨',
    categories: [
      { id: 'bath',     label: 'Bath & Body',    bg: '#F5F3FF', productIds: ['p030'] },
      { id: 'oral',     label: 'Oral Care',      bg: '#EFF6FF', productIds: ['p029'] },
      { id: 'grooming', label: 'Grooming',       bg: '#F8FAFC', productIds: ['p031'] },
      { id: 'feminine', label: 'Feminine Care',  bg: '#FDF2F8', productIds: ['p032'] },
    ],
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    emoji: '💊',
    categories: [
      { id: 'medicine',  label: 'Medicines',      bg: '#F0FDF4', productIds: ['p002', 'p008'] },
      { id: 'firstaid',  label: 'First Aid',      bg: '#FEF2F2', productIds: ['p006', 'p001'] },
      { id: 'devices',   label: 'Devices',        bg: '#F0FDFA', productIds: ['p003'] },
      { id: 'hydration', label: 'Hydration',      bg: '#FFFBEB', productIds: ['p004', 'p007'] },
    ],
  },
  {
    id: 'baby',
    label: 'Baby & Kids',
    emoji: '👶',
    categories: [
      { id: 'diapers',  label: 'Diapers',       bg: '#EFF6FF', productIds: ['p017', 'p019'] },
      { id: 'babycare', label: 'Baby Care',      bg: '#FDF2F8', productIds: ['p018'] },
      { id: 'formula',  label: 'Formula',        bg: '#F0F9FF', productIds: ['p020'] },
      { id: 'powders',  label: 'Powders & Oils', bg: '#FFFBEB', productIds: ['p018'] },
    ],
  },
  {
    id: 'cleaning',
    label: 'Cleaning & Home',
    emoji: '🧹',
    categories: [
      { id: 'laundry', label: 'Laundry',         bg: '#EFF6FF', productIds: ['p022'] },
      { id: 'surface', label: 'Surface Clean',   bg: '#ECFDF5', productIds: ['p023', 'p024'] },
      { id: 'toilet',  label: 'Toilet & Drain',  bg: '#F0FDFA', productIds: ['p021'] },
      { id: 'scrub',   label: 'Scrubs & Pads',   bg: '#ECFDF5', productIds: ['p024'] },
    ],
  },
  {
    id: 'party',
    label: 'Party & Occasions',
    emoji: '🎉',
    categories: [
      { id: 'decor',   label: 'Decorations',  bg: '#FDF2F8', productIds: ['p026', 'p027'] },
      { id: 'plates',  label: 'Serveware',    bg: '#FFFBEB', productIds: ['p025'] },
      { id: 'chips3',  label: 'Party Snacks', bg: '#FFF7ED', productIds: ['p028'] },
      { id: 'candles', label: 'Candles',      bg: '#FFFBEB', productIds: ['p027'] },
    ],
  },
];

// ── Product card — horizontal strip ──────────────────────────────────────────
function ProductCard({ product, onAdd, added }) {
  const disc = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  return (
    <div className="flex-shrink-0 w-32 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-col">
      <div className="relative mb-1.5">
        <img src={product.image} alt={product.name} className="w-full h-20 rounded-xl object-cover bg-gray-50" />
        {disc > 0 && (
          <span className="absolute top-1 left-1 bg-green-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">
            {disc}% off
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold text-gray-900 leading-tight line-clamp-2 mb-1 min-h-[26px]">{product.name}</p>
      <p className="text-[9px] text-gray-400">{product.brand}</p>
      <p className="text-[9px] text-green-600 font-medium mb-1">{product.deliveryMins} min</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-bold text-gray-900">{formatPrice(product.price)}</span>
        <button
          onClick={() => onAdd(product)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center active:scale-90 transition-all ${
            added ? 'bg-green-500' : 'bg-[#FF9900]'
          }`}
        >
          {added ? <Check size={11} className="text-white" /> : <Plus size={11} className="text-white" />}
        </button>
      </div>
    </div>
  );
}

// ── Category chip — 4-column ──────────────────────────────────────────────────
function CategoryChip({ cat }) {
  const navigate = useNavigate();
  const firstProduct = products.find(p => p.id === cat.productIds[0]);
  return (
    <button
      onClick={() => navigate('/search')}
      className="flex flex-col items-center rounded-2xl pt-2 pb-2 px-1 gap-1.5 active:scale-95 transition-all w-full"
      style={{ backgroundColor: cat.bg }}
    >
      {firstProduct ? (
        <img src={firstProduct.image} alt={cat.label} className="w-14 h-14 rounded-xl object-cover" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-white/70 flex items-center justify-center text-2xl">📦</div>
      )}
      <span className="text-[9px] font-semibold text-gray-800 text-center leading-tight line-clamp-2 w-full">
        {cat.label}
      </span>
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function CategoryBrowse() {
  const navigate   = useNavigate();
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState(new Set());

  const handleAdd = (product) => {
    addItem(product, 1);
    setAddedIds(prev => new Set([...prev, product.id]));
    setTimeout(() => {
      setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
    }, 1800);
  };

  return (
    <div className="space-y-8">
      {BROWSE_SECTIONS.map(section => {
        // Unique products for this section's horizontal strip
        const sectionProducts = section.categories
          .flatMap(c => c.productIds.map(id => products.find(p => p.id === id)).filter(Boolean))
          .filter((p, i, arr) => p && arr.findIndex(x => x.id === p.id) === i);

        return (
          <div key={section.id}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{section.emoji}</span>
                <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">{section.label}</h2>
              </div>
              <button
                onClick={() => navigate('/search')}
                className="text-[10px] text-[#FF9900] font-semibold active:opacity-70 flex items-center gap-0.5"
              >
                See all <ChevronRight size={11} />
              </button>
            </div>

            {/* 4-column category chip grid — always visible */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {section.categories.map(cat => (
                <CategoryChip key={cat.id} cat={cat} />
              ))}
            </div>

            {/* Horizontal product strip — always visible, scroll right */}
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {sectionProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAdd}
                  added={addedIds.has(product.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
