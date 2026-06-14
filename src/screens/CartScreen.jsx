import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { DeliveryBadge } from '../components/DeliveryBadge';

export default function CartScreen() {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeItem, total, clearCart } = useCart();

  const handleCheckout = () => {
    navigate('/order-confirmed', { state: { orderTotal: total, deliveryMins: 14 } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-sm mx-auto min-h-screen flex flex-col items-center justify-center pb-24 px-4 animate-fade-in">
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
    <div className="max-w-sm mx-auto min-h-screen pb-40 bg-[#F3F3F3] animate-fade-in">
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
            <p className="text-xs text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <DeliveryBadge mins={14} />
            <button onClick={clearCart} className="text-xs text-gray-400 active:opacity-60 p-1">Clear</button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 animate-slide-up">
            <img
              src={item.image ?? `https://placehold.co/56x56/FEF3C7/D97706?text=${encodeURIComponent((item.brand || item.name || 'Item').split(' ')[0])}`}
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

      {/* Order summary */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span className="font-medium">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery fee</span><span className="font-medium text-green-600">FREE</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-base font-extrabold text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-white border-t border-gray-100 pt-3">
        <div className="max-w-sm mx-auto">
          <button onClick={handleCheckout} className="w-full bg-[#FF9900] text-white rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
            <ShoppingCart size={18} />
            Place Order · {formatPrice(total)} · 14 min
          </button>
        </div>
      </div>
    </div>
  );
}
