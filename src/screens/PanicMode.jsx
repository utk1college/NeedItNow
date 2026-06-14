import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

const EMERGENCY_ITEMS = [
  { id: 'em1', name: 'Electral ORS Sachets (10 pcs)', price: 65, image: 'https://placehold.co/56x56/FCE7F3/9D174D?text=ORS', qty: 1 },
  { id: 'em2', name: 'Band-Aid Flexible Strips 30ct', price: 120, image: 'https://placehold.co/56x56/FEE2E2/991B1B?text=BandAid', qty: 1 },
  { id: 'em3', name: 'Dettol Antiseptic Liquid 250ml', price: 89, image: 'https://placehold.co/56x56/FEF3C7/D97706?text=Dettol', qty: 1 },
  { id: 'em4', name: 'Calpol 500mg Tablets', price: 32, image: 'https://placehold.co/56x56/DBEAFE/1D4ED8?text=Calpol', qty: 1 },
  { id: 'em5', name: 'Glucose-D Orange 500g', price: 95, image: 'https://placehold.co/56x56/FEF9C3/854D0E?text=Glucose', qty: 1 },
];

const TOTAL = EMERGENCY_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);

export default function PanicMode() {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [seconds, setSeconds] = useState(11 * 60);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const handleOrder = () => {
    addItems(EMERGENCY_ITEMS);
    navigate('/order-confirmed', { state: { orderTotal: TOTAL, deliveryMins: mins || 1, isEmergency: true } });
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-white animate-fade-in flex flex-col">
      <div className="bg-red-600 px-4 pt-10 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-red-700 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-red-100 text-xs font-semibold uppercase tracking-widest">Emergency</span>
          </div>
          <div className="w-9" />
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Emergency Order</h1>
          <p className="text-red-200 text-sm">Critical items, fastest delivery</p>
        </div>
        <div className="mt-5 bg-red-700/60 rounded-2xl p-4 text-center">
          <p className="text-red-200 text-xs font-medium mb-1">Estimated arrival</p>
          <p className="text-4xl font-extrabold text-white tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
          <p className="text-red-200 text-xs mt-1">minutes</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <MapPin size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-800">12, Koramangala 4th Block, Bengaluru</p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-2 pb-40">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pre-selected critical items</p>
        {EMERGENCY_ITEMS.map(item => (
          <div key={item.id} className="bg-white border border-red-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{formatPrice(item.price)}</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-white border-t border-gray-100 pt-3">
        <div className="max-w-sm mx-auto space-y-2">
          <button onClick={handleOrder} className="w-full bg-red-600 text-white rounded-full py-4 font-extrabold text-sm active:scale-95 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            Place Emergency Order · {formatPrice(TOTAL)}
          </button>
          <button onClick={() => navigate(-1)} className="w-full text-center text-xs text-gray-400 py-1.5 active:opacity-70">
            Not an emergency? Go back
          </button>
        </div>
      </div>
    </div>
  );
}
