import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { saveOrder } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PROCESSING_STEPS = [
  { at: 0,    label: 'Connecting to payment gateway...' },
  { at: 1200, label: 'Verifying payment details...' },
  { at: 2400, label: 'Authorising transaction...' },
  { at: 3600, label: 'Confirming with bank...' },
  { at: 4400, label: 'Payment successful! 🎉' },
];

const TOTAL_MS = 5000;

export default function PaymentProcessing() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const { user } = useAuth();

  const {
    orderTotal   = 0,
    deliveryMins = 14,
    isEmergency  = false,
    method       = 'UPI',
    cartItems    = [],   // passed from PaymentScreen
  } = location.state ?? {};

  const [elapsed,   setElapsed]   = useState(0);
  const [stepIdx,   setStepIdx]   = useState(0);
  const [done,      setDone]      = useState(false);
  const [savedOrderId, setSavedOrderId] = useState(null);

  // Progress ticker — updates every 50ms
  useEffect(() => {
    const start = Date.now();
    const tick  = setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(Math.min(ms, TOTAL_MS));

      // Advance step label
      const next = [...PROCESSING_STEPS].reverse().find(s => ms >= s.at);
      if (next) setStepIdx(PROCESSING_STEPS.indexOf(next));

      if (ms >= TOTAL_MS) {
        clearInterval(tick);
        setDone(true);
      }
    }, 50);
    return () => clearInterval(tick);
  }, []);

  // Save order to DynamoDB when payment succeeds
  useEffect(() => {
    if (!done) return;

    const persist = async () => {
      const userId = user?.userId ?? 'demo_aahil';
      const items  = cartItems.map(i => ({
        productId: i.id,
        name:      i.name,
        price:     i.price,
        qty:       i.qty,
      }));

      const { data, error } = await saveOrder({
        userId,
        items,
        total:        orderTotal,
        paymentMode:  method,
        deliveryMins,
        address:      user?.address ?? 'Koramangala, Bengaluru',
      });

      if (data?.orderId) {
        setSavedOrderId(data.orderId);
        console.log('[Order] Saved to DynamoDB:', data.orderId);
      } else {
        console.warn('[Order] Save failed:', error);
      }
    };

    persist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // Navigate after success flash
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      navigate('/order-confirmed', {
        replace: true,
        state: { orderTotal, deliveryMins, isEmergency, orderId: savedOrderId },
      });
    }, 800);
    return () => clearTimeout(t);
  }, [done, savedOrderId, navigate, orderTotal, deliveryMins, isEmergency]);

  const progress = Math.min((elapsed / TOTAL_MS) * 100, 100);
  const currentStep = PROCESSING_STEPS[stepIdx];

  const PAYMENT_ICONS = {
    gpay:       '🔵',
    phonepe:    '🟣',
    paytm:      '🔷',
    bhim:       '🟢',
    manual_upi: '📲',
    card_hdfc:  '💳',
    card_sbi:   '💳',
    amazonpay:  '🟠',
    mobikwik:   '🔵',
    cod:        '💵',
  };
  const methodIcon = PAYMENT_ICONS[method] ?? '💳';

  return (
    <div
      className="max-w-sm mx-auto min-h-screen flex flex-col items-center justify-center px-8 animate-fade-in"
      style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)' }}
    >
      {/* Icon area */}
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        {!done && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping scale-125" />
            <span className="absolute inset-0 rounded-full border border-white/5 animate-ping scale-150 animation-delay-300" />
          </>
        )}

        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
          done
            ? 'bg-green-500 scale-110'
            : 'bg-white/10'
        }`}>
          {done
            ? <CheckCircle size={48} className="text-white" strokeWidth={2.5} />
            : <span className="text-5xl">{methodIcon}</span>
          }
        </div>
      </div>

      {/* Amount */}
      <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Amount</p>
      <p className="text-white text-4xl font-extrabold mb-6">{formatPrice(orderTotal)}</p>

      {/* Step label */}
      <div className="h-8 flex items-center justify-center mb-5">
        <p className={`text-sm font-semibold text-center transition-all duration-300 ${
          done ? 'text-green-400' : 'text-white/70'
        }`}>
          {currentStep?.label}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden mb-8">
        <div
          className={`h-1.5 rounded-full transition-all duration-100 ${
            done ? 'bg-green-400' : 'bg-[#FF9900]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex gap-2">
        {PROCESSING_STEPS.map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i <= stepIdx
                ? done ? 'bg-green-400 scale-125' : 'bg-[#FF9900] scale-125'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Success message overlay */}
      {done && (
        <div className="mt-8 text-center animate-scale-in">
          <p className="text-white text-lg font-extrabold">Payment Confirmed!</p>
          <p className="text-white/50 text-xs mt-1">Preparing your order...</p>
        </div>
      )}

      {/* Security note */}
      {!done && (
        <p className="text-white/30 text-[10px] mt-10 text-center">
          🔒 Encrypted · Do not close this screen
        </p>
      )}
    </div>
  );
}
