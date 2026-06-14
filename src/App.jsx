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
import ProfileScreen from './screens/ProfileScreen';
import SmartLists from './screens/SmartLists';
import DailyEssentials from './screens/DailyEssentials';
import SmartPresets from './screens/SmartPresets';
import SearchScreen from './screens/SearchScreen';
import ShoppingMissions from './screens/ShoppingMissions';
import SituationLanding from './screens/SituationLanding';
import MyBasket from './screens/MyBasket';
import CalendarScreen from './screens/CalendarScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentProcessing from './screens/PaymentProcessing';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen font-sans" style={{ backgroundColor: '#F7F8FC' }}>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/my-basket" element={<MyBasket />} />
            <Route path="/calendar-home" element={<CalendarScreen />} />
            <Route path="/shopping-missions" element={<ShoppingMissions />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/lists" element={<SmartLists />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/daily-essentials" element={<DailyEssentials />} />
            <Route path="/smart-presets" element={<SmartPresets />} />
            <Route path="/order-confirmed" element={<OrderConfirmed />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/payment-processing" element={<PaymentProcessing />} />
            <Route path="/situation" element={<SituationLanding />} />
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
