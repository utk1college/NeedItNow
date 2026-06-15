import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, MapPin, Plus, Minus, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { products } from '../data/products';

const EMERGENCY_ITEMS = [
  { id: 'em1', name: 'Electral ORS Sachets (10 pcs)', price: 65, image: '/products/p004.jpg', qty: 1 },
  { id: 'em2', name: 'Band-Aid Flexible Strips 30ct', price: 120, image: '/products/p006.jpg', qty: 1 },
  { id: 'em3', name: 'Dettol Antiseptic Liquid 250ml', price: 89, image: '/products/p001.jpg', qty: 1 },
  { id: 'em4', name: 'Calpol 500mg Tablets', price: 32, image: '/products/p002.jpg', qty: 1 },
  { id: 'em5', name: 'Glucose-D Orange 500g', price: 95, image: '/products/p007.jpg', qty: 1 },
];

// ── AddMoreRow — each row in the "Add more" modal ────────────────────────────
function AddMoreRow({ product, onAdd }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-400">{product.brand}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{formatPrice(product.price * qty)}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => setQty(q => Math.max(1, q - 1))}
          className="w-7 h-7 rounded-full border border-gray-300 bg-white flex items-center justify-center active:scale-90"
        >
          <Minus size={11} className="text-gray-500" />
        </button>
        <span className="text-sm font-bold text-gray-900 w-5 text-center tabular-nums">{qty}</span>
        <button
          onClick={() => { onAdd(product, qty); setQty(1); }}
          className="w-7 h-7 rounded-full bg-[#FF9900] flex items-center justify-center active:scale-90"
        >
          <Plus size={11} className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default function PanicMode() {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [ordered, setOrdered] = useState(false);
  const [seconds, setSeconds] = useState(11 * 60);
  const [selectedItems, setSelectedItems] = useState(new Set(EMERGENCY_ITEMS.map(i => i.id)));
  const [showAddModal, setShowAddModal] = useState(false);
  const [customItems, setCustomItems] = useState(EMERGENCY_ITEMS);
  const [itemCounter, setItemCounter] = useState(0);

  useEffect(() => {
    if (!ordered) return; // Timer only starts AFTER order is placed
    const interval = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [ordered]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const handleToggleItem = (id) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRemoveItem = (id) => {
    setCustomItems(prev => prev.filter(i => i.id !== id));
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleAddProductToEmergency = (product) => {
    const newItem = {
      id: `em_${product.id}_${itemCounter}`,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    };
    setItemCounter(prev => prev + 1);
    setCustomItems(prev => [...prev, newItem]);
    setSelectedItems(prev => new Set([...prev, newItem.id]));
    setShowAddModal(false);
  };

  const handleChangeQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCustomItems(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
    }
  };

  const finalItems = customItems.filter(i => selectedItems.has(i.id));
  const total = finalItems.reduce((s, i) => s + i.price * i.qty, 0);

  const handleOrder = () => {
    if (finalItems.length === 0) return;
    addItems(finalItems);
    setOrdered(true);
    navigate('/payment', { state: { orderTotal: total, deliveryMins: 11, isEmergency: true } });
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
          <p className="text-red-200 text-xs font-medium mb-1">Estimated delivery</p>
          {ordered ? (
            <>
              <p className="text-4xl font-extrabold text-white tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </p>
              <p className="text-red-200 text-xs mt-1">minutes remaining</p>
            </>
          ) : (
            <>
              <p className="text-4xl font-extrabold text-white">~11 min</p>
              <p className="text-red-200 text-xs mt-1">Timer starts when you place order</p>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <MapPin size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-800">12, Koramangala 4th Block, Bengaluru</p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-2 pb-40">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Emergency items ({selectedItems.size})</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs text-[#FF9900] font-semibold active:opacity-70"
          >
            <Plus size={12} /> Add more
          </button>
        </div>
        {customItems.map(item => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-3 flex items-center gap-3 shadow-sm transition-all ${
              selectedItems.has(item.id) ? 'border-red-200 bg-red-50/50' : 'border-gray-100 opacity-50'
            }`}
          >
            {/* Tap image/name to toggle */}
            <button
              onClick={() => handleToggleItem(item.id)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {formatPrice(item.price * item.qty)}
                </p>
              </div>
            </button>

            {/* Stepper if selected, checkbox if not */}
            {selectedItems.has(item.id) ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleChangeQty(item.id, item.qty - 1)}
                  className="w-7 h-7 rounded-full border border-red-200 bg-white flex items-center justify-center active:scale-90 transition-all"
                >
                  <Minus size={12} className="text-red-500" />
                </button>
                <span className="text-sm font-bold text-gray-900 w-5 text-center tabular-nums">{item.qty}</span>
                <button
                  onClick={() => handleChangeQty(item.id, item.qty + 1)}
                  className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Plus size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleToggleItem(item.id)}
                className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"
              />
            )}

            <button
              onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
              className="text-gray-300 hover:text-red-500 p-1 active:scale-95 transition-all flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-white border-t border-gray-100 pt-3">
        <div className="max-w-sm mx-auto space-y-2">
          <button
            onClick={handleOrder}
            disabled={finalItems.length === 0}
            className="w-full bg-red-600 disabled:opacity-50 text-white rounded-full py-4 font-extrabold text-sm active:scale-95 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            <AlertCircle size={18} />
            Place Emergency Order · {formatPrice(total)}
          </button>
          <button onClick={() => navigate(-1)} className="w-full text-center text-xs text-gray-400 py-1.5 active:opacity-70">
            Not an emergency? Go back
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="max-w-sm w-full bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto p-4 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900">Add more items</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg active:scale-95">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {products.slice(0, 20).map(product => (
                <AddMoreRow
                  key={product.id}
                  product={product}
                  onAdd={(p, qty) => handleAddProductToEmergency({ ...p, qty })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



