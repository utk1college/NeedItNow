import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, Users, ChevronRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { DeliveryBadge } from '../components/DeliveryBadge';

// Simulated available groups the user can join/start
const AVAILABLE_GROUPS = [
  {
    id: 'g1',
    name: 'Family Cart',
    members: [
      { id: 'u1', name: 'You',   initials: 'ME', color: '#FF9900' },
      { id: 'u2', name: 'Priya', initials: 'PR', color: '#7C3AED' },
      { id: 'u3', name: 'Dad',   initials: 'DA', color: '#1D8348' },
    ],
    itemCount: 7,
    active: true,
  },
  {
    id: 'g2',
    name: 'Office Lunch',
    members: [
      { id: 'u1', name: 'You',   initials: 'ME', color: '#FF9900' },
      { id: 'u4', name: 'Rahul', initials: 'RA', color: '#0369A1' },
    ],
    itemCount: 3,
    active: false,
  },
  {
    id: 'g3',
    name: 'Weekend BBQ',
    members: [
      { id: 'u1', name: 'You',   initials: 'ME', color: '#FF9900' },
      { id: 'u2', name: 'Priya', initials: 'PR', color: '#7C3AED' },
      { id: 'u4', name: 'Rahul', initials: 'RA', color: '#0369A1' },
      { id: 'u5', name: 'Neha',  initials: 'NE', color: '#BE185D' },
    ],
    itemCount: 0,
    active: false,
  },
];

function MemberBubbles({ members, max = 3 }) {
  const shown = members.slice(0, max);
  const rest  = members.length - max;
  return (
    <div className="flex -space-x-1.5">
      {shown.map(m => (
        <div
          key={m.id}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold border-2 border-white"
          style={{ backgroundColor: m.color }}
        >
          {m.initials[0]}
        </div>
      ))}
      {rest > 0 && (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 border-2 border-white">
          +{rest}
        </div>
      )}
    </div>
  );
}

function GroupPickerModal({ activeGroupId, onSelect, onClose, onCreate }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="max-w-sm w-full bg-white rounded-t-3xl animate-slide-up"
        style={{ paddingBottom: 'calc(1rem + 56px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
        <div className="px-5 pt-3 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-gray-900">Choose a Group</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <X size={14} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-2">
            {AVAILABLE_GROUPS.map(g => {
              const isActive = g.id === activeGroupId;
              return (
                <button
                  key={g.id}
                  onClick={() => onSelect(g.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] ${
                    isActive ? 'border-[#FF9900] bg-orange-50/30' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{g.name}</p>
                      {isActive && (
                        <span className="text-[9px] bg-[#FF9900] text-white font-bold px-1.5 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {g.members.length} members · {g.itemCount} items
                    </p>
                  </div>
                  <MemberBubbles members={g.members} />
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    isActive ? 'border-[#FF9900] bg-[#FF9900]' : 'border-gray-300'
                  }`}>
                    {isActive && <span className="w-2 h-2 rounded-full bg-white block" />}
                  </div>
                </button>
              );
            })}

            {/* Create new group */}
            <button
              onClick={onCreate}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-400 active:bg-gray-50 transition-all"
            >
              <Users size={15} />
              Start a new group cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartScreen() {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeItem, total, clearCart } = useCart();
  const [activeGroupId, setActiveGroupId] = useState('g1'); // default: Family Cart active
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);

  const handleCheckout = () => {
    navigate('/payment', { state: { orderTotal: total, deliveryMins: 14 } });
  };

  const activeGroup = AVAILABLE_GROUPS.find(g => g.id === activeGroupId);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-sm mx-auto min-h-screen flex flex-col items-center justify-center pb-24 px-4 animate-fade-in" style={{ backgroundColor: '#F7F8FC' }}>
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={36} className="text-[#FF9900]" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h2>
        <p className="text-sm text-gray-400 text-center mb-6">Add items from any of the AI features on the home screen</p>
        <button onClick={() => navigate('/')} className="bg-[#FF9900] text-white rounded-full px-8 py-3 font-semibold text-sm active:scale-95 transition-all">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-44 bg-[#F7F8FC] animate-fade-in">

      {/* ── HEADER ───────────────────────────────────── */}
      <div className="bg-white px-4 pt-10 pb-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
            <p className="text-xs text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <DeliveryBadge mins={14} />
            <button onClick={clearCart} className="text-xs text-gray-400 active:opacity-60 p-1">Clear</button>
          </div>
        </div>

        {/* Group Cart toggle row */}
        <div className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${
          isGroupMode ? 'bg-purple-50 border border-purple-100' : 'bg-gray-50 border border-gray-100'
        }`}>
          <button
            onClick={() => setShowGroupPicker(true)}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {isGroupMode && activeGroup ? (
              <>
                <MemberBubbles members={activeGroup.members} max={3} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-purple-800 truncate">{activeGroup.name}</p>
                  <p className="text-[10px] text-purple-500">{activeGroup.members.length} members shopping</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users size={14} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Shop with a group</p>
                  <p className="text-[10px] text-gray-400">Split the bill easily</p>
                </div>
              </>
            )}
          </button>

          {/* Toggle switch */}
          <button
            onClick={() => setIsGroupMode(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              isGroupMode ? 'bg-purple-500' : 'bg-gray-200'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
              isGroupMode ? 'left-[22px]' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* ── CART ITEMS ──────────────────────────────── */}
      <div className="px-4 pt-4 space-y-2">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 animate-slide-up">
            <img
              src={item.image ?? `https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/app/images/products/sliding_image/391893a.jpg`}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{item.name}</p>
              {item.brand && <p className="text-xs text-gray-400 mb-1">{item.brand}</p>}
              <p className="text-base font-bold text-gray-900">{formatPrice(item.price * item.qty)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 active:opacity-60 transition-colors">
                <Trash2 size={14} />
              </button>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center active:scale-90 transition-all">
                  <Minus size={10} className="text-gray-600" />
                </button>
                <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-[#FF9900] flex items-center justify-center active:scale-90 transition-all">
                  <Plus size={10} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ORDER SUMMARY ───────────────────────────── */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span className="font-medium">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery fee</span><span className="font-medium text-green-600">FREE</span>
          </div>
          {isGroupMode && activeGroup && (
            <div className="flex justify-between text-sm text-purple-600">
              <span>Split {activeGroup.members.length} ways</span>
              <span className="font-bold">{formatPrice(Math.ceil(total / activeGroup.members.length))} each</span>
            </div>
          )}
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-base font-extrabold text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* ── GROUP CART VIEW BUTTON ───────────────────── */}
      {isGroupMode && activeGroup && (
        <div className="px-4 pt-3">
          <button
            onClick={() => navigate('/group-cart')}
            className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <MemberBubbles members={activeGroup.members} />
              <div>
                <p className="text-xs font-bold text-purple-800">{activeGroup.name}</p>
                <p className="text-[10px] text-purple-500">Tap to view full group cart</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-purple-400" />
          </button>
        </div>
      )}

      {/* ── BOTTOM CTA ──────────────────────────────── */}
      <div className="fixed bottom-14 left-0 right-0 z-30 px-4 pb-3 pt-3 bg-white border-t border-gray-100 shadow-xl">
        <div className="max-w-sm mx-auto space-y-2">
          <button
            onClick={handleCheckout}
            className="w-full text-white rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF6B00 100%)', boxShadow: '0 4px 20px rgba(255,153,0,0.35)' }}
          >
            <ShoppingCart size={18} />
            {isGroupMode && activeGroup
              ? `Pay my share · ${formatPrice(Math.ceil(total / activeGroup.members.length))}`
              : `Proceed to Pay · ${formatPrice(total)}`
            }
          </button>
          {isGroupMode && (
            <button
              onClick={handleCheckout}
              className="w-full border border-gray-200 text-gray-700 rounded-full py-3 font-semibold text-sm active:scale-95 transition-all"
            >
              Pay full amount · {formatPrice(total)}
            </button>
          )}
        </div>
      </div>

      {/* ── GROUP PICKER MODAL ──────────────────────── */}
      {showGroupPicker && (
        <GroupPickerModal
          activeGroupId={activeGroupId}
          onSelect={(id) => { setActiveGroupId(id); setIsGroupMode(true); setShowGroupPicker(false); }}
          onClose={() => setShowGroupPicker(false)}
          onCreate={() => { setShowGroupPicker(false); navigate('/group-cart'); }}
        />
      )}
    </div>
  );
}

