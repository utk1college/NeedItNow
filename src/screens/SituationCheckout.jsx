import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { callClaude, PROMPTS } from '../utils/claude';
import { safeParseJSON, formatPrice } from '../utils/helpers';
import { LoadingDots } from '../components/LoadingDots';
import { DeliveryBadge } from '../components/DeliveryBadge';
import { useCart } from '../context/CartContext';

const FALLBACKS = {
  'kid fever': [
    { name: 'Calpol 500mg Tablets', brand: 'GSK', price: 32, reason: 'Reduces fever fast in kids', image: 'https://placehold.co/60x60/DBEAFE/1E40AF?text=Calpol' },
    { name: 'Omron Digital Thermometer', brand: 'Omron', price: 249, reason: 'Monitor temp accurately', image: 'https://placehold.co/60x60/D1FAE5/065F46?text=Omron' },
    { name: 'Electral ORS Sachets', brand: 'Electral', price: 65, reason: 'Prevent dehydration', image: 'https://placehold.co/60x60/FCE7F3/9D174D?text=ORS' },
    { name: 'Vicks VapoRub 50g', brand: 'Vicks', price: 79, reason: 'Ease congestion at night', image: 'https://placehold.co/60x60/EDE9FE/6D28D9?text=Vicks' },
  ],
  'guests coming': [
    { name: 'Paper Plates (50 pcs)', brand: 'Areca', price: 120, reason: 'Hassle-free serving', image: 'https://placehold.co/60x60/FEF9C3/78350F?text=Plates' },
    { name: 'Thums Up 2L Bottle', brand: 'Thums Up', price: 95, reason: 'Drinks sorted for everyone', image: 'https://placehold.co/60x60/D1FAE5/064E3B?text=ThumsUp' },
    { name: "Lay's Party Pack Assorted", brand: "Lay's", price: 175, reason: 'Snacking while they arrive', image: 'https://placehold.co/60x60/FEF9C3/713F12?text=PartyPack' },
    { name: 'Britannia Good Day Cookies', brand: 'Britannia', price: 45, reason: 'Quick dessert option', image: 'https://placehold.co/60x60/FCE7F3/831843?text=GoodDay' },
  ],
  'power cut': [
    { name: 'Birthday Cake Candles 24pcs', brand: 'Camlin', price: 45, reason: 'Emergency lighting', image: 'https://placehold.co/60x60/FEF3C7/D97706?text=Candles' },
    { name: 'Bisleri Water 1L (6 pack)', brand: 'Bisleri', price: 120, reason: 'Store drinking water', image: 'https://placehold.co/60x60/DBEAFE/1E40AF?text=Water' },
    { name: 'Britannia Good Day Cookies', brand: 'Britannia', price: 45, reason: 'No-cook snack option', image: 'https://placehold.co/60x60/FCE7F3/831843?text=GoodDay' },
  ],
};

function getFallback(situation) {
  const s = situation.toLowerCase();
  if (s.includes('fever') || s.includes('sick') || s.includes('ill')) return FALLBACKS['kid fever'];
  if (s.includes('guest') || s.includes('party') || s.includes('coming')) return FALLBACKS['guests coming'];
  return FALLBACKS['power cut'];
}

function QuantityStepper({ qty, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, qty - 1))}
        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center active:scale-90 transition-all"
      >
        <Minus size={12} className="text-gray-600" />
      </button>
      <span className="text-sm font-semibold text-gray-900 w-4 text-center">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className="w-7 h-7 rounded-full bg-[#FF9900] flex items-center justify-center active:scale-90 transition-all"
      >
        <Plus size={12} className="text-white" />
      </button>
    </div>
  );
}

export default function SituationCheckout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { addItems } = useCart();
  const situation = state?.situation ?? 'my kid has fever';

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState({});
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { systemPrompt, userMessage } = PROMPTS.situationCheckout(situation);
        const raw = await callClaude(systemPrompt, userMessage);
        const parsed = safeParseJSON(raw);
        const result = parsed?.items ?? getFallback(situation);
        initItems(result);
      } catch {
        initItems(getFallback(situation));
      } finally {
        setLoading(false);
      }
    })();
  }, [situation]);

  function initItems(result) {
    setItems(result);
    const sel = {}, qty = {};
    result.forEach((_, i) => { sel[i] = true; qty[i] = 1; });
    setSelected(sel);
    setQuantities(qty);
  }

  const selectedItems = items.filter((_, i) => selected[i]);
  const total = selectedItems.reduce((sum, item, i) => {
    const origIdx = items.indexOf(item);
    return sum + item.price * (quantities[origIdx] || 1);
  }, 0);

  const handleOrder = () => {
    const cartItems = selectedItems.map((item, i) => {
      const origIdx = items.indexOf(item);
      return {
        id: `sc-${origIdx}`,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image ?? `https://placehold.co/60x60/FEF3C7/D97706?text=${encodeURIComponent(item.brand ?? 'Item')}`,
        qty: quantities[origIdx] || 1,
      };
    });
    addItems(cartItems);
    navigate('/order-confirmed', { state: { orderTotal: total, deliveryMins: 14 } });
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-32 bg-[#F3F3F3] animate-fade-in">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Situation Checkout</h1>
            <DeliveryBadge mins={14} />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Situation chip */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-orange-800">Cart for: <span className="font-semibold">{situation}</span></span>
            <button onClick={() => navigate(-1)} className="text-orange-400 ml-2">
              <X size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingDots message="Finding what you need..." />
        ) : (
          <div className="space-y-3 animate-slide-up">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{items.length} items suggested by AI</p>
            {items.map((item, i) => (
              <div key={i} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${selected[i] ? 'border-orange-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex gap-3">
                  <label className="flex items-start gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selected[i]}
                      onChange={e => setSelected(s => ({ ...s, [i]: e.target.checked }))}
                      className="mt-1 accent-[#FF9900] w-4 h-4 flex-shrink-0"
                    />
                    <img
                      src={item.image ?? `https://placehold.co/60x60/FEF3C7/D97706?text=${encodeURIComponent(item.brand ?? 'Item')}`}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-400 mb-1">{item.brand}</p>
                      <p className="text-xs text-gray-500 italic mb-2">"{item.reason}"</p>
                      <p className="text-base font-bold text-gray-900">{formatPrice(item.price)}</p>
                    </div>
                  </label>
                  <div className="flex flex-col items-end justify-between">
                    <QuantityStepper qty={quantities[i] || 1} onChange={q => {
                      if (q === 0) setSelected(s => ({ ...s, [i]: false }));
                      setQuantities(q2 => ({ ...q2, [i]: Math.max(1, q) }));
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {!loading && selectedItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-[#F3F3F3] via-[#F3F3F3] pt-4">
          <div className="max-w-sm mx-auto">
            <button
              onClick={handleOrder}
              className="w-full bg-[#FF9900] text-white rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              Order all · {formatPrice(total)} · 14 min
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
