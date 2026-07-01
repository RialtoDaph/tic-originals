import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, User, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementTicker from '@/components/layout/AnnouncementTicker';
import { base44 } from '@/api/base44Client';

export default function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { itemCount, setIsOpen } = useCart();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
      <nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b transition-all duration-500 ${scrolled ? 'border-border shadow-sm' : 'border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-4 transition-all duration-500 ${scrolled ? 'h-16 md:h-16' : 'h-20 md:h-20'}`}>
            <button className="lg:hidden shrink-0" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="shrink-0">
              <img
                src="https://media.base44.com/images/public/69e5695817245a39fd1a3317/5c0b2056b_Untitleddesign.png"
                alt="Till I Collapse"
                className={`w-auto transition-all duration-500 ${scrolled ? 'h-20 md:h-20' : 'h-28 md:h-32 lg:h-40'}`}
              />
            </Link>

            <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
              {links.map(link => (
                <Link key={link.to} to={link.to}
                  className="text-xs tracking-[0.15em] uppercase text-gray-text hover:text-dark transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button onClick={toggleLang}
                className="flex items-center gap-1 text-xs tracking-wider uppercase text-gray-text hover:text-dark transition-colors">
                <Globe className="w-3.5 h-3.5" />
                {lang === 'en' ? 'DE' : 'EN'}
              </button>
              {user?.role === 'admin' && (
                <Link to="/admin" title="Admin Dashboard" className="text-cyan hover:text-cyan-dark transition-colors">
                  <Shield className="w-4 h-4" />
                </Link>
              )}
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