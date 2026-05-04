import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementTicker from '@/components/layout/AnnouncementTicker';
import { base44 } from '@/api/base44Client';

export default function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { itemCount, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const links = [
    { to: '/products', label: t('nav.shop') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/faq', label: t('nav.faq') },
    { to: '/tracking', label: t('order.trackOrder') },
  ];

  return (
    <>
      <AnnouncementTicker />
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden lg:flex items-center gap-8">
              {links.map(link => (
                <Link key={link.to} to={link.to}
                  className="text-xs tracking-[0.15em] uppercase text-gray-text hover:text-dark transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img
                src="https://media.base44.com/images/public/69e5695817245a39fd1a3317/f282074c4_TIC.png"
                alt="TIC"
                className="h-8 md:h-10 w-auto"
              />
            </Link>

            <div className="flex items-center gap-4">
              <button onClick={toggleLang}
                className="flex items-center gap-1 text-xs tracking-wider uppercase text-gray-text hover:text-dark transition-colors">
                <Globe className="w-3.5 h-3.5" />
                {lang === 'en' ? 'DE' : 'EN'}
              </button>
              {user ? (
                <Link to="/account" title="My Account" className="text-gray-text hover:text-dark transition-colors">
                  <User className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={() => base44.auth.redirectToLogin(window.location.href)} title="Login" className="text-gray-text hover:text-dark transition-colors">
                  <User className="w-4 h-4" />
                </button>
              )}

            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="px-4 py-6 space-y-4">
                {links.map(link => (
                  <Link key={link.to} to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm tracking-[0.15em] uppercase text-gray-text hover:text-dark transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}