import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ChevronRight, Zap } from 'lucide-react';
import { callClaude, PROMPTS } from '../utils/claude';
import { safeParseJSON, formatPrice, timeAgo } from '../utils/helpers';
import { LoadingDots } from '../components/LoadingDots';
import { DeliveryBadge } from '../components/DeliveryBadge';
import { useCart } from '../context/CartContext';
import { orders } from '../data/orders';
import { getProductById } from '../data/products';

const FALLBACK_PREDICTIONS = [
  { productName: 'Pampers Active Baby Diapers', reasoning: 'Ordered 3 times, likely running low', urgency: 'high', productId: 'p017' },
  { productName: 'Amul Taaza Milk 1L', reasoning: 'Weekly staple, 13 days since last order', urgency: 'high', productId: 'p010' },
  { productName: 'Aashirvaad Atta 5kg', reasoning: 'Monthly staple, due for replenishment', urgency: 'medium', productId: 'p009' },
  { productName: 'Colgate MaxFresh Toothpaste', reasoning: 'Last ordered 81 days ago', urgency: 'medium', productId: 'p029' },
];

const URGENCY_COLORS = {
  high: 'bg-red-50 text-red-600 border-red-100',
  medium: 'bg-orange-50 text-orange-600 border-orange-100',
  low: 'bg-green-50 text-green-600 border-green-100',
};

export default function SmartReorder() {
  const navigate = useNavigate();
  const { addItem, addItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [added, setAdded] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const summary = orders.map(o => ({
          date: o.date, daysAgo: o.daysAgo,
          items: o.items.map(i => ({ name: getProductById(i.productId)?.name, qty: i.qty })),
        }));
        const { systemPrompt, userMessage } = PROMPTS.smartReorder(summary);
        const raw = await callClaude(systemPrompt, userMessage);
        const parsed = safeParseJSON(raw);
        setPredictions(parsed?.predictions?.length ? parsed.predictions : FALLBACK_PREDICTIONS);
      } catch {
        setPredictions(FALLBACK_PREDICTIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const enriched = predictions.map(p => {
    const product = p.productId ? getProductById(p.productId) : null;
    const matchedOrder = orders.find(o => o.items.some(i => getProductById(i.productId)?.name?.toLowerCase().includes(p.productName?.split(' ')[0]?.toLowerCase())));
    return { ...p, product, daysAgo: matchedOrder?.daysAgo };
  });

  const handleAddAll = () => {
    const items = enriched.filter(e => e.product).map(e => ({ ...e.product, qty: 1 }));
    addItems(items);
    navigate('/order-confirmed', { state: { orderTotal: items.reduce((s, i) => s + i.price, 0), deliveryMins: 13 } });
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-32 bg-[#F3F3F3] animate-fade-in">
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Smart Re-order</h1>
            <p className="text-xs text-gray-400">AI-predicted replenishments</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          <LoadingDots message="Analysing your order history..." />
        ) : (
          <div className="space-y-3 animate-slide-up">
            {enriched.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  {item.product?.image && (
                    <img src={item.product.image} alt={item.productName} className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${URGENCY_COLORS[item.urgency] || URGENCY_COLORS.medium}`}>
                        {item.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{item.daysAgo ? `Last ordered ${timeAgo(item.daysAgo)}` : 'From your history'}</p>
                    <p className="text-xs text-gray-500 italic">"{item.reasoning}"</p>
                    {item.product && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-gray-900">{formatPrice(item.product.price)}</p>
                          <DeliveryBadge mins={item.product.deliveryMins} />
                        </div>
                        <button
                          onClick={() => { addItem(item.product, 1); setAdded(a => ({ ...a, [i]: true })); }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-all flex items-center gap-1 ${added[i] ? 'bg-green-100 text-green-700' : 'bg-[#FF9900] text-white'}`}
                        >
                          {added[i] ? '✓ Added' : <>Re-order <ChevronRight size={12} /></>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-[#F3F3F3] via-[#F3F3F3] pt-4">
          <div className="max-w-sm mx-auto">
            <button onClick={handleAddAll} className="w-full bg-[#FF9900] text-white rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              Re-order all suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
