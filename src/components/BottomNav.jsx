import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, List, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const tabs = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/cart', label: 'Cart', Icon: ShoppingCart },
  { path: '/lists', label: 'Lists', Icon: List },
  { path: '/profile', label: 'Profile', Icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-sm mx-auto flex">
        {tabs.map(({ path, label, Icon }) => {
          const isActive = pathname === path;
          const isCart = path === '/cart';
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all active:scale-95 relative ${
                isActive ? 'text-[#FF9900]' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF9900] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#FF9900]' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#FF9900] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
