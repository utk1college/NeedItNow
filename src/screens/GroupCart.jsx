import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, Plus, Trash2, Users, ShoppingCart, Check } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { users, groupCartItems, priyaNewItem } from '../data/users';
import { products } from '../data/products';

// ── Avatar helpers ────────────────────────────────────────────────────────────
function Avatar({ user, size = 'md' }) {
  const s = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs';
  return (
    <div
      className={`${s} rounded-full flex items-center justify-center text-white font-extrabold border-2 border-white shadow-sm`}
      style={{ backgroundColor: user.color }}
    >
      {user.isMe ? 'Me' : user.initials}
    </div>
  );
}

function AvatarStack({ members, max = 4 }) {
  const shown = members.slice(0, max);
  const rest  = members.length - max;
  return (
    <div className="flex -space-x-2">
      {shown.map(u => <Avatar key={u.id} user={u} size="sm" />)}
      {rest > 0 && (
        <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600">
          +{rest}
        </div>
      )}
    </div>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────────
function ItemCard({ item, user, onRemove, isMe }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3"
         style={{ borderLeftColor: user?.color, borderLeftWidth: 3 }}>
      <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
        <p className="text-[10px] text-gray-400">
          Qty: {item.qty} · Added by {user?.isMe ? 'you' : user?.name ?? 'someone'}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.qty)}</p>
        {isMe && (
          <button onClick={onRemove} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center active:scale-90">
            <Trash2 size={11} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Add items picker ──────────────────────────────────────────────────────────
function AddItemsSheet({ onAdd, onClose, alreadyAdded }) {
  const [query, setQuery] = useState('');
  const filtered = products.filter(p => {
    if (!query.trim()) return true;
    return p.name.toLowerCase().includes(query.toLowerCase()) ||
           p.brand.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="max-w-sm w-full bg-white rounded-t-3xl overflow-y-auto animate-slide-up"
        style={{ maxHeight: 'calc(100vh - 56px - 16px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
        <div className="px-4 pb-2 sticky top-0 bg-white z-10 pt-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-900">Add to Group Cart</p>
            <button onClick={onClose} className="text-xs text-gray-400 active:opacity-70">Done</button>
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9900]"
            autoFocus
          />
        </div>
        <div className="px-4 pb-8 space-y-2 pt-2">
          {filtered.map(p => {
            const added = alreadyAdded.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => !added && onAdd(p)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                  added ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100 active:scale-[0.98]'
                }`}
              >
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.brand} · {formatPrice(p.price)}</p>
                </div>
                {added
                  ? <Check size={16} className="text-green-500 flex-shrink-0" />
                  : <Plus size={16} className="text-[#FF9900] flex-shrink-0" />
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main GroupCart ────────────────────────────────────────────────────────────
export default function GroupCart() {
  const navigate  = useNavigate();
  const { addItems } = useCart();
  const [items, setItems]         = useState(groupCartItems);
  const [toast, setToast]         = useState(null);
  const [showAddSheet, setAddSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'members'

  // Simulate Priya adding an item after 3s
  useEffect(() => {
    const t = setTimeout(() => {
      setItems(prev => [...prev, priyaNewItem]);
      setToast('Priya added Maggi Noodles 🍜');
      setTimeout(() => setToast(null), 3000);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const me        = users.find(u => u.isMe);
  const others    = users.filter(u => !u.isMe);
  const myItems   = items.filter(i => i.addedBy === me?.id);

  const grandTotal   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const myTotal      = myItems.reduce((s, i) => s + i.price * i.qty, 0);
  const splitAmount  = Math.ceil(grandTotal / users.length);

  const alreadyAdded = new Set(items.map(i => i.productId));

  const handleAddProduct = (product) => {
    const newItem = {
      productId: product.id,
      qty: 1,
      addedBy: me?.id ?? 'u1',
      name: product.name,
      price: product.price,
      image: product.image,
    };
    setItems(prev => [...prev, newItem]);
    setToast(`You added ${product.name.split(' ').slice(0,3).join(' ')}`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleRemoveMyItem = (productId) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.addedBy === me?.id)));
  };

  const handlePay = (amount) => {
    addItems(items.map(i => ({ ...i, id: i.productId })));
    navigate('/payment', { state: { orderTotal: amount, deliveryMins: 13 } });
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen animate-fade-in" style={{ backgroundColor: '#F7F8FC' }}>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg animate-slide-up flex items-center gap-2 max-w-[280px]">
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────── */}
      <div
        className="px-4 pt-10 pb-0 sticky top-0 z-30"
        style={{ background: 'linear-gradient(160deg, #3B1F8B 0%, #5B2D9E 60%, #7C3AED 100%)' }}
      >
        <div className="flex items-center gap-3 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-extrabold text-white">Family Cart</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <AvatarStack members={users} />
              <p className="text-white/60 text-[11px]">{users.length} members · {items.length} items</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-2 active:scale-95">
            <Link2 size={13} className="text-white" />
            <span className="text-white text-[11px] font-semibold">Invite</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-0">
          {[
            { id: 'cart',    label: 'Cart',    count: items.length },
            { id: 'members', label: 'Members', count: users.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F7F8FC] text-purple-700'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              {tab.label}
              <span className={`text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-white/20 text-white'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CART TAB ─────────────────────────────────── */}
      {activeTab === 'cart' && (
        <div className="px-4 pt-4 pb-44 space-y-4">

          {/* My items section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Avatar user={me} size="sm" />
                <p className="text-xs font-bold text-gray-900">Your items</p>
                <span className="text-[10px] text-gray-400">· {formatPrice(myTotal)}</span>
              </div>
              <button
                onClick={() => setAddSheet(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-purple-600 active:opacity-70"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            {myItems.length === 0 ? (
              <button
                onClick={() => setAddSheet(true)}
                className="w-full border-2 border-dashed border-purple-200 rounded-2xl py-4 text-sm text-purple-400 font-semibold flex items-center justify-center gap-2 active:bg-purple-50"
              >
                <Plus size={15} /> Add your items
              </button>
            ) : (
              <div className="space-y-2">
                {myItems.map((item, idx) => (
                  <ItemCard
                    key={`${item.productId}-${idx}`}
                    item={item}
                    user={me}
                    isMe={true}
                    onRemove={() => handleRemoveMyItem(item.productId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Others' items */}
          {others.map(u => {
            const uItems = items.filter(i => i.addedBy === u.id);
            if (!uItems.length) return null;
            const uTotal = uItems.reduce((s, i) => s + i.price * i.qty, 0);
            return (
              <div key={u.id}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Avatar user={u} size="sm" />
                  <p className="text-xs font-bold text-gray-900">{u.name}'s items</p>
                  <span className="text-[10px] text-gray-400">· {formatPrice(uTotal)}</span>
                </div>
                <div className="space-y-2">
                  {uItems.map((item, idx) => (
                    <ItemCard
                      key={`${item.productId}-${idx}`}
                      item={item}
                      user={u}
                      isMe={false}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bill Summary</p>
            {users.map(u => {
              const ut = items.filter(i => i.addedBy === u.id).reduce((s, i) => s + i.price * i.qty, 0);
              return (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar user={u} size="sm" />
                    <span className="text-xs font-medium text-gray-700">{u.isMe ? 'You' : u.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(ut)}</span>
                </div>
              );
            })}
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-900">Group total</span>
              <span className="text-base font-extrabold text-gray-900">{formatPrice(grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between bg-purple-50 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-purple-700">Split equally</span>
              <span className="text-sm font-bold text-purple-700">{formatPrice(splitAmount)}/person</span>
            </div>
          </div>
        </div>
      )}

      {/* ── MEMBERS TAB ──────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="px-4 pt-4 pb-32 space-y-3">
          {users.map(u => {
            const ut      = items.filter(i => i.addedBy === u.id).reduce((s, i) => s + i.price * i.qty, 0);
            const uCount  = items.filter(i => i.addedBy === u.id).length;
            return (
              <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <Avatar user={u} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{u.isMe ? 'You (me)' : u.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {uCount} item{uCount !== 1 ? 's' : ''} · {formatPrice(ut)}
                  </p>
                </div>
                {u.isMe && (
                  <span className="text-[9px] bg-[#FF9900] text-white font-bold px-2 py-0.5 rounded-full">You</span>
                )}
              </div>
            );
          })}

          {/* Invite more */}
          <button className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm text-gray-400 font-semibold flex items-center justify-center gap-2 active:bg-gray-50">
            <Users size={16} /> Invite more people
          </button>
        </div>
      )}

      {/* ── BOTTOM CTA ──────────────────────────────── */}
      <div className="fixed bottom-14 left-0 right-0 z-30 px-4 pb-3 pt-3 bg-white border-t border-gray-100 shadow-xl">
        <div className="max-w-sm mx-auto space-y-2">
          <button
            onClick={() => handlePay(splitAmount)}
            className="w-full text-white rounded-full py-3.5 font-bold text-sm active:scale-95 transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B2D9E 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
          >
            Pay my share · {formatPrice(splitAmount)}
          </button>
          <button
            onClick={() => handlePay(grandTotal)}
            className="w-full border border-gray-200 text-gray-700 rounded-full py-3 font-semibold text-sm active:scale-95 transition-all"
          >
            <ShoppingCart size={14} className="inline mr-1.5" />
            Pay full · {formatPrice(grandTotal)}
          </button>
        </div>
      </div>

      {/* ── ADD ITEMS SHEET ──────────────────────────── */}
      {showAddSheet && (
        <AddItemsSheet
          onAdd={handleAddProduct}
          onClose={() => setAddSheet(false)}
          alreadyAdded={alreadyAdded}
        />
      )}
    </div>
  );
}
