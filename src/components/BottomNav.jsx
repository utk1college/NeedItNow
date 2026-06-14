import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, List, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const tabs = [
  { path: '/',           label: 'Home',    Icon: Home        },
  { path: '/cart',       label: 'Cart',    Icon: ShoppingCart },
  { path: '/my-basket',  label: 'Basket',  Icon: List        },
  { path: '/profile',    label: 'Profile', Icon: User        },
];

export function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-gray-100/80">
      <div className="max-w-sm mx-auto flex items-stretch">
        {tabs.map(({ path, label, Icon }) => {
          const isActive = pathname === path;
          const isCart   = path === '/cart';

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 active:scale-95 transition-all relative"
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-x-3 top-1 bottom-1 bg-[#FF9900]/10 rounded-2xl" />
              )}

              <div className="relative z-10">
                {isActive ? (
                  /* Filled look when active */
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Icon size={22} strokeWidth={2.5} className="text-[#FF9900]" />
                  </div>
                ) : (
                  <Icon size={21} strokeWidth={1.8} className="text-gray-400" />
                )}
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#FF9900] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-sm">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-semibold tracking-tight relative z-10 ${
                  isActive ? 'text-[#FF9900]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
