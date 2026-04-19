import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const { lang } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('tic_cookie_consent');
    if (!consent) setShow(true);
  }, []);

  const accept = (type) => {
    localStorage.setItem('tic_cookie_consent', type);
    setShow(false);
  };

  const text = lang === 'de'
    ? { title: 'Cookie-Einstellungen', body: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.', essential: 'Nur essenzielle', all: 'Alle akzeptieren' }
    : { title: 'Cookie Settings', body: 'We use cookies to improve your experience.', essential: 'Essential only', all: 'Accept all' };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t shadow-lg"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h4 className="font-heading text-lg font-semibold">{text.title}</h4>
              <p className="text-sm text-gray-text mt-1">{text.body}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button variant="outline" size="sm" onClick={() => accept('essential')}
                className="text-xs tracking-wider uppercase">
                {text.essential}
              </Button>
              <Button size="sm" onClick={() => accept('all')}
                className="bg-cyan text-dark-deep hover:bg-cyan-dark text-xs tracking-wider uppercase">
                {text.all}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}