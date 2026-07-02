import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, Shield, User } from 'lucide-react';
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
      <nav className={`sticky top-0 z-50 backdrop-blur-2xl transition-all duration-700 ease-out ${scrolled ? 'bg-white/70 border-b border-black/[0.04]' : 'bg-white/40 border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-4 transition-all duration-700 ease-out ${scrolled ? 'h-14 md:h-16' : 'h-20 md:h-24'}`}>
            <Link to="/" className="shrink-0">
              <img
                src="https://media.base44.com/images/public/69e5695817245a39fd1a3317/5c0b2056b_Untitleddesign.png"
                alt="Till I Collapse"
                className={`w-auto transition-all duration-700 ease-out ${scrolled ? 'h-14 md:h-16' : 'h-24 md:h-28 lg:h-32'}`}
              />
            </Link>

            <div className="hidden lg:flex items-center gap-10 flex-1 justify-end">
              {links.map(link => (
                <Link key={link.to} to={link.to}
                  className="relative text-[11px] tracking-[0.2em] uppercase text-gray-text hover:text-dark transition-colors duration-300 group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-dark transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <button onClick={toggleLang}
                className="flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-gray-text hover:text-dark transition-colors duration-300">
                <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                {lang === 'en' ? 'DE' : 'EN'}
              </button>
              {user?.role === 'admin' && (
                <Link to="/admin" title="Admin Dashboard" className="text-cyan hover:text-cyan-dark transition-colors duration-300">
                  <Shield className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              )}
              <Link
                to={user ? '/account' : '/login'}
                title={user ? (lang === 'de' ? 'Mein Konto' : 'My Account') : (lang === 'de' ? 'Anmelden' : 'Sign In')}
                className="text-gray-text hover:text-dark transition-colors duration-300"
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <button
                className="lg:hidden shrink-0 text-gray-text hover:text-dark transition-colors duration-300"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t border-black/[0.04]"
            >
              <div className="px-6 py-8 space-y-5">
                {links.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 + i * 0.04, ease: 'easeOut' }}
                  >
                    <Link to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm tracking-[0.2em] uppercase text-gray-text hover:text-dark transition-colors duration-300">
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}