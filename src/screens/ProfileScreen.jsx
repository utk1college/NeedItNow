import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, MapPin, Phone, Calendar, Mail,
  Edit2, Check, ChevronRight, ShoppingBag, Package,
  Star, Zap, CreditCard, RefreshCw, Clock,
} from 'lucide-react';
import { orders, orderStats } from '../data/orders';
import { getProductById } from '../data/products';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

// ── Profile data ──────────────────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: 'Aahil Sharma',
  age: 28,
  birthday: '1998-03-15',
  phone: '+91 98765 43210',
  email: 'aahil.sharma@gmail.com',
  address: '12, Koramangala 4th Block, Bengaluru 560034',
  avatar: null,
};

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_STYLES = {
  delivered: { label: 'Delivered', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  out_for_delivery: { label: 'Out for delivery', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  processing: { label: 'Processing', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

// ── Payment icon map ──────────────────────────────────────────────────────────
const PAYMENT_ICONS = {
  'UPI': '📲',
  'Amazon Pay': '🏷️',
  'Credit Card': '💳',
  'Debit Card': '💳',
  'Cash': '💵',
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function groupOrdersByMonth(orderList) {
  const groups = {};
  for (const order of orderList) {
    const d = new Date(order.date);
    const key = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(order);
  }
  return groups;
}

// ── ORDER CARD ────────────────────────────────────────────────────────────────
function OrderCard({ order, onReorder }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLES[order.status] ?? STATUS_STYLES.delivered;
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

  // Resolve first 3 products for thumbnail strip
  const resolvedItems = order.items
    .map(i => ({ ...i, product: getProductById(i.productId) }))
    .filter(i => i.product);

  const topItems = resolvedItems.slice(0, 3);
  const remainingCount = resolvedItems.length - 3;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: thumbnails */}
          <div className="flex -space-x-2 flex-shrink-0">
            {topItems.map((i, idx) => (
              <img
                key={idx}
                src={i.product.image}
                alt={i.product.name}
                className="w-11 h-11 rounded-xl object-cover bg-gray-50 border-2 border-white"
              />
            ))}
            {remainingCount > 0 && (
              <div className="w-11 h-11 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-500">+{remainingCount}</span>
              </div>
            )}
          </div>

          {/* Right: order meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {resolvedItems[0]?.product?.name ?? 'Order'}
                {resolvedItems.length > 1 && (
                  <span className="text-gray-400 font-normal"> & {resolvedItems.length - 1} more</span>
                )}
              </p>
            </div>

            {/* Status badge */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${status.bg} mb-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className={`text-[10px] font-semibold ${status.text}`}>{status.label}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{order.displayDate}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-900">{formatPrice(order.total)}</span>
                <ChevronRight
                  size={14}
                  className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery time badge */}
        <div className="flex items-center gap-3 mt-2.5">
          {order.deliveryMins && (
            <div className="flex items-center gap-1">
              <Zap size={11} className="text-[#FF9900]" />
              <span className="text-[10px] text-gray-500">Delivered in {order.deliveryMins} min</span>
            </div>
          )}
          {order.savingsAmount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-green-600">
                You saved {formatPrice(order.savingsAmount)}
              </span>
            </div>
          )}
          {order.occasion && (
            <span className="text-[10px] text-purple-600 font-medium">{order.occasion}</span>
          )}
        </div>
      </button>

      {/* Expanded: full item list */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Item rows */}
          <div className="px-4 pt-3 pb-1 space-y-2.5">
            {resolvedItems.map((i, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={i.product.image}
                  alt={i.product.name}
                  className="w-10 h-10 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 leading-tight truncate">{i.product.name}</p>
                  <p className="text-[10px] text-gray-400">{i.product.brand} · Qty {i.qty}</p>
                </div>
                <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                  {formatPrice(i.product.price * i.qty)}
                </p>
              </div>
            ))}
          </div>

          {/* Order meta row */}
          <div className="px-4 py-3 border-t border-gray-50 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-700">{formatPrice(order.total + order.savingsAmount)}</span>
            </div>
            {order.savingsAmount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Discount</span>
                <span className="font-medium text-green-600">− {formatPrice(order.savingsAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Delivery fee</span>
              <span className="font-medium text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery + payment row */}
          <div className="px-4 pb-3 flex items-center gap-4 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin size={10} />
              <span>{order.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{PAYMENT_ICONS[order.paymentMode] ?? '💰'}</span>
              <span>{order.paymentMode}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{order.deliveryMins} min</span>
            </div>
          </div>

          {/* Reorder CTA */}
          <div className="px-4 pb-4">
            <button
              onClick={() => onReorder(order)}
              className="w-full bg-[#FF9900] text-white rounded-full py-2.5 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={13} />
              Reorder · {formatPrice(order.total)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROFILE SCREEN ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders'

  const handleSave = () => { setProfile(editData); setEditing(false); };
  const handleCancel = () => { setEditData(profile); setEditing(false); };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setEditData(prev => ({ ...prev, avatar: result }));
      if (!editing) setProfile(prev => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const formatBirthday = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleReorder = (order) => {
    const items = order.items
      .map(i => {
        const p = getProductById(i.productId);
        return p ? { ...p, qty: i.qty } : null;
      })
      .filter(Boolean);
    addItems(items);
    navigate('/cart');
  };

  const monthGroups = groupOrdersByMonth(orders);

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-[#F7F8FC] pb-24 animate-fade-in">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div
        className="px-4 pt-10 pb-6 rounded-b-3xl relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)' }}
      >
        {/* Decorative */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#FF9900]/10" />
        <div className="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5" />
        <div className="flex items-center justify-between mb-5 relative z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-base">My Account</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-all"
          >
            {editing ? <Check size={18} className="text-white" /> : <Edit2 size={16} className="text-white" />}
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative flex-shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-[#FF9900]">{initials}</span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow cursor-pointer active:scale-95">
              <Camera size={13} className="text-[#FF9900]" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">{profile.name}</h2>
            <p className="text-white/70 text-xs">{profile.email}</p>
            <p className="text-white/60 text-[10px] mt-0.5">Member since {orderStats.memberSince}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-2 mt-4 relative z-10">
          {[
            { label: 'Orders', value: orderStats.totalOrders },
            { label: 'Saved', value: formatPrice(orderStats.totalSaved) },
            { label: 'Avg order', value: formatPrice(orderStats.avgOrderValue) },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-white/15 rounded-2xl p-2.5 text-center">
              <p className="text-white text-sm font-extrabold">{s.value}</p>
              <p className="text-white/70 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TAB BAR ────────────────────────────────────────── */}
      <div className="flex bg-white border-b border-gray-100 px-4 sticky top-0 z-30">
        {[
          { key: 'profile', label: 'Profile',     icon: <ShoppingBag size={14} /> },
          { key: 'orders',  label: 'Past Orders', icon: <Package size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === tab.key
                ? 'text-[#FF9900] border-[#FF9900]'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PAST ORDERS TAB ────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="px-4 pt-4 space-y-5">
          {/* Summary banner */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Shopping Summary</p>
              <span className="text-[10px] text-gray-400">Last 6 months</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SummaryTile icon={<ShoppingBag size={16} className="text-[#FF9900]" />} label="Total Orders" value={orderStats.totalOrders.toString()} bg="bg-orange-50" />
              <SummaryTile icon={<Star size={16} className="text-yellow-500" />} label="Total Saved" value={formatPrice(orderStats.totalSaved)} bg="bg-yellow-50" />
              <SummaryTile icon={<CreditCard size={16} className="text-blue-500" />} label="Total Spent" value={formatPrice(orderStats.totalSpent)} bg="bg-blue-50" />
              <SummaryTile icon={<Zap size={16} className="text-green-500" />} label="Avg Delivery" value="12 min" bg="bg-green-50" />
            </div>
          </div>

          {/* Orders grouped by month */}
          {Object.entries(monthGroups).map(([month, monthOrders]) => (
            <div key={month}>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-bold text-gray-900">{month}</p>
                <p className="text-[10px] text-gray-400">{monthOrders.length} order{monthOrders.length > 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-3">
                {monthOrders.map(order => (
                  <OrderCard key={order.id} order={order} onReorder={handleReorder} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PROFILE TAB ────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="px-4 pt-4 space-y-3">
          {editing ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium">Full Name</label>
                <input type="text" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-[#FF9900]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-medium">Age</label>
                  <input type="number" value={editData.age} onChange={e => setEditData(p => ({ ...p, age: parseInt(e.target.value) || 0 }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-[#FF9900]" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Birthday</label>
                  <input type="date" value={editData.birthday} onChange={e => setEditData(p => ({ ...p, birthday: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-[#FF9900]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Phone Number</label>
                <input type="tel" value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-[#FF9900]" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Email</label>
                <input type="email" value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-[#FF9900]" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Address</label>
                <textarea value={editData.address} onChange={e => setEditData(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-[#FF9900] resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleCancel} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-all">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-full bg-[#FF9900] text-white text-sm font-semibold active:scale-95 transition-all">Save</button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                <ProfileRow icon={<Phone size={16} className="text-[#FF9900]" />} label="Phone" value={profile.phone} />
                <ProfileRow icon={<Mail size={16} className="text-[#FF9900]" />} label="Email" value={profile.email} />
                <ProfileRow icon={<Calendar size={16} className="text-[#FF9900]" />} label="Birthday" value={formatBirthday(profile.birthday)} />
                <ProfileRow icon={<MapPin size={16} className="text-[#FF9900]" />} label="Address" value={profile.address} />
              </div>

              {/* Settings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Preferences</p>
                <SettingRow label="Notifications" value="Enabled" />
                <SettingRow label="Delivery Preference" value="Express (< 15 min)" />
                <SettingRow label="Payment Method" value="UPI — Amazon Pay" />
                <SettingRow label="Language" value="English" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryTile({ icon, label, value, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-3 flex items-center gap-2.5`}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-xs text-gray-400 font-medium">{value}</span>
    </div>
  );
}
