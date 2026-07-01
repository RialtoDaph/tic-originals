import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const { lang } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('tic_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (type) => {
    localStorage.setItem('tic_cookie_consent', type);
    setShow(false);
  };

  const text = lang === 'de'
    ? { body: 'Wir nutzen Cookies für eine bessere Erfahrung.', essential: 'Nur essenzielle', all: 'Alle akzeptieren' }
    : { body: 'We use cookies to improve your experience.', essential: 'Essential only', all: 'Accept all' };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-[64px] lg:bottom-4 left-2 right-2 lg:left-4 lg:right-auto lg:max-w-md z-40 pb-safe"
        >
          <div className="bg-dark-deep text-white p-5 md:p-6 shadow-2xl grain-overlay relative">
            <button
              onClick={() => accept('essential')}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-[10px] tracking-[0.4em] uppercase text-cyan mb-2">— Cookies</p>
            <p className="text-sm text-white/80 leading-relaxed mb-5 pr-8">{text.body}</p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => accept('all')}
                className="bg-cyan text-dark-deep px-5 py-3 text-[10px] tracking-[0.25em] uppercase hover:bg-white transition-colors"
              >
                {text.all}
              </button>
              <button
                onClick={() => accept('essential')}
                className="border border-white/30 text-white px-5 py-3 text-[10px] tracking-[0.25em] uppercase hover:border-cyan hover:text-cyan transition-colors"
              >
                {text.essential}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}