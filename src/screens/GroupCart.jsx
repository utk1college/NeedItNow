import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, Users } from 'lucide-react';
import { AvatarPill } from '../components/AvatarPill';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { users, groupCartItems, priyaNewItem } from '../data/users';

export default function GroupCart() {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [items, setItems] = useState(groupCartItems);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setItems(prev => [...prev, priyaNewItem]);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const getUserItems = (uid) => items.filter(i => i.addedBy === uid);
  const getUserTotal = (uid) => getUserItems(uid).reduce((s, i) => s + i.price * i.qty, 0);
  const grandTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const splitAmount = Math.ceil(grandTotal / users.length);

  const getUserById = (uid) => users.find(u => u.id === uid);

  const handlePay = (amount) => {
    addItems(items.map(i => ({ ...i, id: i.productId })));
    navigate('/order-confirmed', { state: { orderTotal: amount, deliveryMins: 13 } });
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-40 bg-[#F3F3F3] animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg animate-slide-up flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[9px] font-bold">PR</div>
          Priya added Maggi Noodles 🍜
        </div>
      )}

      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Group Cart</h1>
            <p className="text-xs text-gray-400">Shop together, pay together</p>
          </div>
        </div>
        {/* Members bar */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <Users size={14} className="text-gray-400" />
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: u.color }}>
                {u.initials}
              </div>
            </div>
          ))}
          <span className="text-xs text-gray-500 font-medium ml-1">3 members</span>
          <button className="ml-auto flex items-center gap-1 text-xs text-[#FF9900] font-semibold">
            <Link2 size={12} /> Share link
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {users.map(u => {
          const uItems = getUserItems(u.id);
          if (!uItems.length) return null;
          return (
            <div key={u.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: u.color }}>
                  {u.initials}
                </div>
                <span className="text-xs font-semibold text-gray-700">{u.name}'s items</span>
                <span className="ml-auto text-xs font-bold text-gray-900">{formatPrice(getUserTotal(u.id))}</span>
              </div>
              <div className="space-y-2">
                {uItems.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3" style={{ borderLeftColor: u.color, borderLeftWidth: 3 }}>
                    <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Summary</p>
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between">
              <AvatarPill user={u} />
              <span className="text-sm font-medium text-gray-700">{formatPrice(getUserTotal(u.id))}</span>
            </div>
          ))}
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Group total</span>
            <span className="text-base font-extrabold text-gray-900">{formatPrice(grandTotal)}</span>
          </div>
          <div className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2">
            <span className="text-xs font-medium text-orange-700">Split equally</span>
            <span className="text-sm font-bold text-orange-700">{formatPrice(splitAmount)} each</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-white border-t border-gray-100 pt-3">
        <div className="max-w-sm mx-auto space-y-2">
          <button onClick={() => handlePay(splitAmount)} className="w-full bg-[#FF9900] text-white rounded-full py-3.5 font-bold text-sm active:scale-95 transition-all">
            Pay my share · {formatPrice(splitAmount)}
          </button>
          <button onClick={() => handlePay(grandTotal)} className="w-full border border-gray-200 text-gray-700 rounded-full py-3 font-semibold text-sm active:scale-95 transition-all">
            Pay full · {formatPrice(grandTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}
