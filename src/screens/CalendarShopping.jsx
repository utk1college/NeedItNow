import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { callClaude, PROMPTS } from '../utils/claude';
import { safeParseJSON, formatPrice, daysFromNowLabel } from '../utils/helpers';
import { LoadingDots } from '../components/LoadingDots';
import { DeliveryBadge } from '../components/DeliveryBadge';
import { useCart } from '../context/CartContext';
import { calendarEvents, eventFallbacks } from '../data/calendarEvents';
import { QuantityStepper } from '../components/QuantityStepper';

export default function CalendarShopping() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { addItems } = useCart();

  const event = calendarEvents.find(e => e.id === eventId);
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState('');
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!event) return;
    (async () => {
      try {
        setLoading(true);
        const { systemPrompt, userMessage } = PROMPTS.calendarShopping(event);
        const raw = await callClaude(systemPrompt, userMessage);
        const parsed = safeParseJSON(raw);
        if (parsed?.items?.length) {
          setHeadline(parsed.headline || `Perfect for ${event.title}`);
          setItems(parsed.items);
          const q = {};
          parsed.items.forEach((_, i) => { q[i] = 1; });
          setQuantities(q);
        } else {
          throw new Error('no items');
        }
      } catch {
        const fallback = eventFallbacks[event.type] || eventFallbacks.other;
        setHeadline(`Perfect for ${event.title}`);
        setItems(fallback);
        const q = {};
        fallback.forEach((_, i) => { q[i] = 1; });
        setQuantities(q);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = items.reduce((s, item, i) => s + item.price * (quantities[i] || 1), 0);

  const handleOrderAll = () => {
    addItems(items.map((item, i) => ({
      id: `cal-${eventId}-${i}`,
      name: item.name,
      price: item.price,
      image: `https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/391893a.jpg' ')[0])}`,
      qty: quantities[i] || 1,
    })));
    navigate('/payment', { state: { orderTotal: total, deliveryMins: 14 } });
  };

  if (!event) {
    return (
      <div className="max-w-sm mx-auto min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-36 bg-[#F7F8FC] animate-fade-in">
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{event.emoji}</span>
            <div>
              <h1 className="text-base font-bold text-gray-900">{event.title}</h1>
              <p className="text-xs text-[#FF9900] font-semibold">{daysFromNowLabel(event.daysFromNow)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          <LoadingDots message="Preparing your shopping list..." />
        ) : (
          <div className="animate-slide-up space-y-3">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold text-orange-800">✨ {headline}</p>
              <p className="text-xs text-orange-600 mt-0.5">{items.length} items · AI-curated just for you</p>
            </div>

            {items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                <img
                  src={`https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/391893a.jpg' ')[0])}`}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-500 italic mt-0.5">"{item.reason}"</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-gray-900">{formatPrice(item.price * (quantities[i] || 1))}</p>
                      <DeliveryBadge mins={14} />
                    </div>
                    <QuantityStepper
                      qty={quantities[i] || 1}
                      onChange={q => setQuantities(prev => ({ ...prev, [i]: q }))}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-[#F7F8FC] via-[#F7F8FC] pt-4">
          <div className="max-w-sm mx-auto">
            <button onClick={handleOrderAll} className="w-full bg-[#FF9900] text-white rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              <ShoppingBag size={18} />
              Add all to cart · {formatPrice(total)} · 14 min
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


