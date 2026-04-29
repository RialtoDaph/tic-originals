import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const { itemCount, setIsOpen } = useCart();
  const { lang } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { icon: Home, label: lang === 'de' ? 'Start' : 'Home', to: '/' },
    { icon: Search, label: lang === 'de' ? 'Shop' : 'Shop', to: '/products' },
    { icon: Info, label: lang === 'de' ? 'Über uns' : 'About', to: '/about' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border">
      <div className="flex items-center">
        {navItems.map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              isActive(to) ? 'text-dark' : 'text-gray-text'
            }`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase">{label}</span>
          </Link>
        ))}

        {/* Cart */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-text relative">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyan text-dark-deep text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase">
            {lang === 'de' ? 'Warenkorb' : 'Cart'}
          </span>
        </button>
      </div>
    </div>
  );
}