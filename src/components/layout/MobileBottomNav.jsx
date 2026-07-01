import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const { itemCount, setIsOpen } = useCart();
  const { lang } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label, active }) => (
    <Link
      to={to}
      className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] relative group"
    >
      {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan" />}
      <Icon className={`w-5 h-5 transition-colors ${active ? 'text-dark-deep' : 'text-gray-text group-hover:text-dark-deep'}`} />
      <span className={`text-[9px] tracking-[0.2em] uppercase ${active ? 'text-dark-deep' : 'text-gray-text'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-stretch">
        <NavLink to="/" icon={Home} label={lang === 'de' ? 'Start' : 'Home'} active={isActive('/')} />
        <NavLink to="/products" icon={Search} label="Shop" active={isActive('/products')} />
        <NavLink to="/account" icon={User} label={lang === 'de' ? 'Konto' : 'Account'} active={isActive('/account')} />

        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] relative group"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-gray-text group-hover:text-dark-deep transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-cyan text-dark-deep text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-[0.2em] uppercase text-gray-text">{lang === 'de' ? 'Bag' : 'Bag'}</span>
        </button>
      </div>
    </div>
  );
}