import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MapPin, Package } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

export default function OrderConfirmed() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const progressRef = useRef(null);

  const orderTotal = state?.orderTotal ?? 340;
  const deliveryMins = state?.deliveryMins ?? 14;
  const isEmergency = state?.isEmergency ?? false;
  const orderId = state?.orderId ?? `ORD-${Date.now().toString(36).toUpperCase()}`;

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => {
      if (progressRef.current) {
        progressRef.current.style.width = '35%';
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`max-w-sm mx-auto min-h-screen flex flex-col pb-24 animate-fade-in ${isEmergency ? 'bg-red-50' : 'bg-[#F3F3F3]'}`}>
      {/* Hero Section */}
      <div className={`flex flex-col items-center justify-center px-6 pt-16 pb-10 ${isEmergency ? 'bg-red-600' : 'bg-[#FF9900]'}`}>
        <div className="bg-white rounded-full p-4 mb-4 animate-scale-in shadow-lg">
          <CheckCircle size={48} className={isEmergency ? 'text-red-500' : 'text-[#FF9900]'} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Order Placed!</h1>
        <p className="text-sm text-white/80 font-medium">
          {isEmergency ? '🚨 Help is on the way' : '✨ Sit back and relax'}
        </p>
      </div>

      <div className="flex-1 px-4 pt-6 space-y-4">
        {/* Delivery ETA Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Arriving in</p>
              <p className={`text-4xl font-extrabold ${isEmergency ? 'text-red-600' : 'text-[#FF9900]'}`}>
                {deliveryMins} <span className="text-xl font-semibold text-gray-500">min</span>
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isEmergency ? 'bg-red-50' : 'bg-orange-50'}`}>
              <Package size={28} className={isEmergency ? 'text-red-500' : 'text-[#FF9900]'} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              ref={progressRef}
              className={`h-2 rounded-full transition-all duration-[3000ms] ease-out ${isEmergency ? 'bg-red-500' : 'bg-[#FF9900]'}`}
              style={{ width: '5%' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400">Order placed</span>
            <span className="text-[10px] text-gray-400">On the way</span>
            <span className="text-[10px] text-gray-400">Delivered</span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Order total</span>
            <span className="text-base font-bold text-gray-900">{formatPrice(orderTotal)}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Delivering to</p>
              <p className="text-sm text-gray-700 font-medium mt-0.5">12, Koramangala 4th Block, Bengaluru</p>
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Order ID</span>
            <span className="text-xs font-mono text-gray-500">{orderId}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          <button
            className={`w-full py-3.5 rounded-full font-semibold text-sm text-white active:scale-95 transition-all ${isEmergency ? 'bg-red-600' : 'bg-[#FF9900]'}`}
          >
            Track Order →
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-full font-semibold text-sm border border-gray-200 text-gray-700 active:scale-95 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
