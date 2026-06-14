import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Lock, Shield } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

// ── Payment methods ───────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: 'gpay',    label: 'Google Pay',   color: '#4285F4', icon: '🔵', upiId: 'aahil@gpay' },
  { id: 'phonepe', label: 'PhonePe',      color: '#5F259F', icon: '🟣', upiId: 'aahil@ybl' },
  { id: 'paytm',   label: 'Paytm',        color: '#00B9F1', icon: '🔷', upiId: 'aahil@paytm' },
  { id: 'bhim',    label: 'BHIM UPI',     color: '#007935', icon: '🟢', upiId: 'aahil@upi' },
];

const CARDS = [
  { id: 'card_hdfc', label: 'HDFC Bank Visa', last4: '4242', network: 'VISA', color: '#003B6F' },
  { id: 'card_sbi',  label: 'SBI Mastercard', last4: '8891', network: 'MC',   color: '#EB001B' },
];

const WALLETS = [
  { id: 'amazonpay', label: 'Amazon Pay',    balance: 'Balance ₹0', color: '#FF9900', icon: '🟠' },
  { id: 'mobikwik',  label: 'MobiKwik',      balance: 'Balance ₹0', color: '#00ADEF', icon: '🔵' },
];

const COD = { id: 'cod', label: 'Cash on Delivery', sublabel: 'Pay when your order arrives' };

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">{children}</p>
  );
}

function MethodRow({ selected, onSelect, left, title, subtitle, right }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 bg-white rounded-2xl border-2 px-4 py-3.5 transition-all active:scale-[0.98] text-left ${
        selected ? 'border-[#FF9900] bg-orange-50/30' : 'border-gray-100'
      }`}
    >
      <div className="flex-shrink-0">{left}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {right ?? (
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
          selected ? 'border-[#FF9900] bg-[#FF9900]' : 'border-gray-300'
        }`}>
          {selected && <span className="flex items-center justify-center h-full"><span className="w-2 h-2 rounded-full bg-white block mx-auto" /></span>}
        </div>
      )}
    </button>
  );
}

// ── Main PaymentScreen ────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { clearCart } = useCart();

  const {
    orderTotal    = 0,
    deliveryMins  = 14,
    isEmergency   = false,
  } = location.state ?? {};

  const [selected, setSelected] = useState('gpay');

  const handlePay = () => {
    navigate('/payment-processing', {
      replace: true,
      state: { orderTotal, deliveryMins, isEmergency, method: selected },
    });
    clearCart();
  };

  // Derive display label for selected method
  const allMethods = [
    ...UPI_APPS.map(u => ({ id: u.id, label: u.label })),
    ...CARDS.map(c  => ({ id: c.id, label: `${c.network} ····${c.last4}` })),
    ...WALLETS.map(w => ({ id: w.id, label: w.label })),
    { id: 'cod', label: 'Cash on Delivery' },
  ];
  const selectedLabel = allMethods.find(m => m.id === selected)?.label ?? 'UPI';

  return (
    <div className="max-w-sm mx-auto min-h-screen animate-fade-in pb-40" style={{ backgroundColor: '#F7F8FC' }}>

      {/* Header */}
      <div
        className="px-4 pt-10 pb-5 sticky top-0 z-30"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-extrabold text-white">Payment</h1>
            <p className="text-white/50 text-[11px]">Choose how you want to pay</p>
          </div>
          <div className="flex items-center gap-1 bg-green-500/20 px-2.5 py-1 rounded-full">
            <Lock size={10} className="text-green-400" />
            <span className="text-[10px] text-green-400 font-semibold">Secure</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* Order total card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Order total</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{formatPrice(orderTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Delivery</p>
            <p className="text-sm font-bold text-green-600 mt-0.5">FREE · {deliveryMins} min</p>
          </div>
        </div>

        {/* UPI */}
        <div>
          <SectionLabel>UPI</SectionLabel>
          <div className="space-y-2">
            {UPI_APPS.map(u => (
              <MethodRow
                key={u.id}
                selected={selected === u.id}
                onSelect={() => setSelected(u.id)}
                left={
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: u.color + '18' }}
                  >
                    {u.icon}
                  </div>
                }
                title={u.label}
                subtitle={u.upiId}
              />
            ))}

            {/* Manual UPI ID */}
            <div className={`w-full bg-white rounded-2xl border-2 px-4 py-3 ${selected === 'manual_upi' ? 'border-[#FF9900] bg-orange-50/30' : 'border-gray-100'}`}>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Enter UPI ID</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="yourname@bank"
                  onFocus={() => setSelected('manual_upi')}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] transition-colors"
                />
                <button
                  onClick={() => setSelected('manual_upi')}
                  className="bg-[#FF9900] text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Cards */}
        <div>
          <SectionLabel>Saved Cards</SectionLabel>
          <div className="space-y-2">
            {CARDS.map(c => (
              <MethodRow
                key={c.id}
                selected={selected === c.id}
                onSelect={() => setSelected(c.id)}
                left={
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-white"
                       style={{ backgroundColor: c.color }}>
                    {c.network}
                  </div>
                }
                title={c.label}
                subtitle={`···· ···· ···· ${c.last4}`}
              />
            ))}
            {/* Add new card */}
            <button className="w-full flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-400 active:bg-gray-50 transition-all">
              <span className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">💳</span>
              <span>Add new card</span>
              <ChevronRight size={14} className="ml-auto" />
            </button>
          </div>
        </div>

        {/* Wallets */}
        <div>
          <SectionLabel>Wallets</SectionLabel>
          <div className="space-y-2">
            {WALLETS.map(w => (
              <MethodRow
                key={w.id}
                selected={selected === w.id}
                onSelect={() => setSelected(w.id)}
                left={
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                       style={{ backgroundColor: w.color + '18' }}>
                    {w.icon}
                  </div>
                }
                title={w.label}
                subtitle={w.balance}
              />
            ))}
          </div>
        </div>

        {/* COD */}
        <div>
          <SectionLabel>Other</SectionLabel>
          <MethodRow
            selected={selected === 'cod'}
            onSelect={() => setSelected('cod')}
            left={
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">💵</div>
            }
            title={COD.label}
            subtitle={COD.sublabel}
          />
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Shield size={13} />
            <span className="text-[10px] font-medium">256-bit SSL</span>
          </div>
          <span className="text-gray-200">·</span>
          <span className="text-[10px] text-gray-400 font-medium">PCI DSS Compliant</span>
          <span className="text-gray-200">·</span>
          <span className="text-[10px] text-gray-400 font-medium">RBI Regulated</span>
        </div>
      </div>

      {/* Pay CTA */}
      <div className="fixed bottom-14 left-0 right-0 z-30 px-4 pb-3 pt-3 bg-white border-t border-gray-100 shadow-xl">
        <div className="max-w-sm mx-auto">
          <button
            onClick={handlePay}
            className="w-full text-white rounded-full py-4 font-extrabold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF6B00 100%)', boxShadow: '0 4px 20px rgba(255,153,0,0.35)' }}
          >
            <Lock size={15} />
            Pay {formatPrice(orderTotal)} via {selectedLabel}
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-2">Simulated payment · no real charge</p>
        </div>
      </div>
    </div>
  );
}
