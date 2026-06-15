import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, ChevronRight, Tag } from 'lucide-react';
import { products } from '../data/products';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

// ── Zepto-style product card ──────────────────────────────────────────────────
function DealCard({ product, onAdd, added }) {
  const savings = product.mrp - product.price;
  return (
    <div className="flex-shrink-0 w-36 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Image area */}
      <div className="relative bg-gray-50 h-32 flex items-center justify-center">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        {/* Add button — bottom right */}
        <button
          onClick={() => onAdd(product)}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-white ${
            added ? 'bg-green-500' : 'bg-white'
          }`}
        >
          {added
            ? <Check size={14} className="text-white" />
            : <Plus size={16} className="text-[#FF9900] font-bold" strokeWidth={3} />
          }
        </button>
      </div>
      {/* Price row */}
      <div className="px-2 pt-1.5 pb-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-extrabold text-white bg-green-600 px-1.5 py-0.5 rounded-md leading-none">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.mrp)}</span>
        </div>
        {savings > 0 && (
          <p className="text-[9px] text-green-600 font-bold">{formatPrice(savings)} OFF</p>
        )}
        <p className="text-[10px] font-semibold text-gray-900 leading-tight mt-0.5 line-clamp-2">{product.name}</p>
        <p className="text-[9px] text-gray-400 mt-0.5">{product.brand}</p>
      </div>
    </div>
  );
}

// ── Bento deal card (hero + 2×2 grid) ────────────────────────────────────────
function BentoSection({ section }) {
  const navigate = useNavigate();
  const { hero, cards, bg, accentColor } = section;

  return (
    <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: bg }}>
      {/* Header */}
      {section.headline && (
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>
            {section.eyebrow}
          </p>
          <p className="text-lg font-extrabold text-gray-900 leading-tight">{section.headline}</p>
        </div>
      )}

      {/* Bento grid */}
      <div className="flex gap-2 px-3 pb-3">
        {/* Hero card */}
        <button
          onClick={() => navigate('/search')}
          className="flex-[1.1] rounded-2xl p-3 flex flex-col justify-between active:scale-[0.97] transition-all"
          style={{ backgroundColor: accentColor + '22', minHeight: 160 }}
        >
          <p className="text-sm font-extrabold text-gray-900 leading-tight">{hero.label}</p>
          <div>
            {hero.product && (
              <img
                src={hero.product.image}
                alt={hero.product.name}
                className="w-full h-20 object-cover rounded-xl mb-2"
              />
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs line-through text-gray-400">{formatPrice(hero.mrp)}</span>
              <span className="text-base font-extrabold text-gray-900">{formatPrice(hero.price)}</span>
            </div>
          </div>
        </button>

        {/* 2×2 mini cards */}
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          {cards.map((card, i) => (
            <button
              key={i}
              onClick={() => navigate('/search')}
              className="rounded-xl p-2 flex flex-col gap-1 active:scale-95 transition-all relative overflow-hidden"
              style={{ backgroundColor: card.bg ?? '#ffffff' }}
            >
              <p className="text-[10px] font-bold text-gray-900 leading-tight">{card.label}</p>
              {card.product && (
                <img src={card.product.image} alt={card.label} className="w-full h-10 object-cover rounded-lg" />
              )}
              <div className="mt-auto">
                {card.badge && (
                  <span className="text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-md block w-fit"
                        style={{ backgroundColor: accentColor }}>
                    {card.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Coupons strip ─────────────────────────────────────────────────────────────
function CouponsStrip() {
  const coupons = [
    { off: '₹50 OFF',  min: 'above ₹599',  color: '#16a34a' },
    { off: '₹100 OFF', min: 'above ₹1199', color: '#16a34a' },
    { off: '₹150 OFF', min: 'above ₹1799', color: '#16a34a' },
    { off: '₹200 OFF', min: 'above ₹2499', color: '#16a34a' },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-extrabold text-gray-900">Coupons & Offers</p>
        <button className="text-[10px] text-[#FF9900] font-semibold flex items-center gap-0.5">
          See all <ChevronRight size={11} />
        </button>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
        {coupons.map((c, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-28 bg-white rounded-2xl border-2 border-dashed border-green-200 p-3 flex flex-col items-center gap-1"
          >
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mb-1">
              <Tag size={14} className="text-green-600" />
            </div>
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">FLAT</p>
            <p className="text-sm font-extrabold text-green-600 leading-none">{c.off}</p>
            <p className="text-[9px] text-gray-400 text-center leading-tight">{c.min}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Data definitions ──────────────────────────────────────────────────────────
function buildBentoSections(allProducts) {
  const p = (id) => allProducts.find(x => x.id === id);
  return [
    {
      id: 'wellness',
      eyebrow: 'WELLNESS DAYS',
      headline: 'Feel-Good Fest',
      bg: '#F0FDF4',
      accentColor: '#16a34a',
      hero: { label: 'Organic & Premium Picks', product: p('p014'), mrp: 165, price: 142 },
      cards: [
        { label: 'Dry Fruits & More',       product: p('p007'), badge: 'Starts at ₹95',   bg: '#ECFDF5' },
        { label: 'Guilt Free Indulgence',   product: p('p013'), badge: 'Starts at ₹45',   bg: '#F0FDFA' },
        { label: 'Health & Wellness',       product: p('p002'), badge: 'UP TO 70% OFF',    bg: '#ECFDF5' },
        { label: 'Clean & Care',            product: p('p022'), badge: 'Starts at ₹89',   bg: '#F0FDFA' },
      ],
    },
  ];
}

// ── Deal strips (Zepto "Blockbuster Deals" style) ─────────────────────────────
const DEAL_STRIPS = [
  {
    id: 'blockbuster',
    headline: 'Blockbuster Deals 🔥',
    productIds: ['p017', 'p022', 'p029', 'p030', 'p031', 'p032'],
  },
  {
    id: 'fresh',
    headline: 'Fresh Picks 🥗',
    productIds: ['p010', 'p015', 'p014', 'p009', 'p016', 'p013'],
  },
  {
    id: 'health',
    headline: 'Health Essentials 💊',
    productIds: ['p002', 'p004', 'p005', 'p001', 'p006', 'p007'],
  },
];

// ── Main HomeSections export ──────────────────────────────────────────────────
export function HomeSections() {
  const navigate  = useNavigate();
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState(new Set());

  const handleAdd = (product) => {
    addItem(product, 1);
    setAddedIds(prev => new Set([...prev, product.id]));
    setTimeout(() => {
      setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
    }, 1800);
  };

  const bentoSections  = buildBentoSections(products);

  return (
    <div className="space-y-6">
      {/* ── PROMO BANNER ──────────────────────────────── */}
      <div
        className="rounded-3xl px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF6B00 100%)' }}
      >
        <div>
          <p className="text-white font-extrabold text-base leading-tight">₹0 Fees</p>
          <p className="text-white/80 text-[11px] mt-0.5">Zero delivery fee on every order</p>
        </div>
        <div className="text-right">
          <p className="text-white font-extrabold text-[11px] leading-tight uppercase tracking-wide">Everyday</p>
          <p className="text-yellow-200 font-extrabold text-sm">Lowest Prices</p>
        </div>
      </div>

      <div className="flex gap-3 text-[10px] text-gray-500 font-medium px-1">
        {['₹0 Handling Fee', '₹0 Delivery Fee', '₹0 Surge Fee'].map(t => (
          <div key={t} className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[8px] font-bold flex-shrink-0">✓</span>
            {t}
          </div>
        ))}
      </div>

      {/* ── DEAL STRIPS ───────────────────────────────── */}
      {DEAL_STRIPS.map(strip => {
        const stripProducts = strip.productIds
          .map(id => products.find(p => p.id === id))
          .filter(Boolean);
        return (
          <div key={strip.id}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-extrabold text-gray-900">{strip.headline}</p>
              <button
                onClick={() => navigate('/search')}
                className="text-[10px] text-[#FF9900] font-semibold flex items-center gap-0.5 active:opacity-70"
              >
                See All <ChevronRight size={11} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {stripProducts.map(product => (
                <DealCard
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

      {/* ── BENTO DEAL SECTIONS ───────────────────────── */}
      {bentoSections.map(section => (
        <BentoSection
          key={section.id}
          section={section}
          onAdd={handleAdd}
          addedIds={addedIds}
        />
      ))}

      {/* ── COUPONS ───────────────────────────────────── */}
      <CouponsStrip />
    </div>
  );
}
