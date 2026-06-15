import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomNav } from './components/BottomNav';
import LoginScreen from './screens/LoginScreen';
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

// ── Auth gate — shows LoginScreen until authenticated ─────────────────────────
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FF9900]/30 border-t-[#FF9900] rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
