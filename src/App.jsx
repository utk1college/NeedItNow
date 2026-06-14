import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { BottomNav } from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import OrderConfirmed from './screens/OrderConfirmed';
import SituationCheckout from './screens/SituationCheckout';
import PanicMode from './screens/PanicMode';
import SmartReorder from './screens/SmartReorder';
import PhotoToCart from './screens/PhotoToCart';
import GroupCart from './screens/GroupCart';
import CalendarShopping from './screens/CalendarShopping';

function PlaceholderScreen({ title }) {
  return (
    <div className="max-w-sm mx-auto min-h-screen flex items-center justify-center pb-24">
      <p className="text-gray-400 text-sm">{title} — coming soon</p>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="bg-[#F3F3F3] min-h-screen font-sans">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/lists" element={<PlaceholderScreen title="Lists" />} />
            <Route path="/profile" element={<PlaceholderScreen title="Profile" />} />
            <Route path="/order-confirmed" element={<OrderConfirmed />} />
            <Route path="/situation-checkout" element={<SituationCheckout />} />
            <Route path="/panic" element={<PanicMode />} />
            <Route path="/smart-reorder" element={<SmartReorder />} />
            <Route path="/photo-to-cart" element={<PhotoToCart />} />
            <Route path="/group-cart" element={<GroupCart />} />
            <Route path="/calendar/:eventId" element={<CalendarShopping />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
