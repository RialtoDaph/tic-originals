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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-border safe-area-inset-bottom">
      <div className="flex items-center">
        <Link to="/"
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${isActive('/') ? 'text-dark' : 'text-gray-text'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase">{lang === 'de' ? 'Start' : 'Home'}</span>
        </Link>

        <Link to="/products"
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${isActive('/products') ? 'text-dark' : 'text-gray-text'}`}>
          <Search className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase">Shop</span>
        </Link>

        <Link to="/about"
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${isActive('/about') ? 'text-dark' : 'text-gray-text'}`}>
          <Info className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase">{lang === 'de' ? 'Über uns' : 'About'}</span>
        </Link>

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
          <span className="text-[10px] tracking-wider uppercase">{lang === 'de' ? 'Warenkorb' : 'Cart'}</span>
        </button>
      </div>
    </div>
  );
}