import React, { useState, useEffect } from 'react';
import { subscribeNewsletter } from '@/functions/subscribeNewsletter';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'tic_newsletter_dismissed';
const DELAY_MS = 6000; // show after 6s

export default function NewsletterPopup() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await subscribeNewsletter({ email, language: lang });
    setLoading(false);
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const copy = {
    en: {
      eyebrow: 'Exclusive Offer',
      headline: 'Get 10% Off Your First Order',
      sub: 'Join the TIC community. No spam — just drops, deals & brand stories.',
      placeholder: 'your@email.com',
      cta: 'Claim My 10% Discount',
      thanks: "You're in! Check your inbox — your 10% discount code is on the way.",
      thanksTitle: 'Check your inbox',
      later: 'Maybe later',
    },
    de: {
      eyebrow: 'Exklusives Angebot',
      headline: '10 % auf deine erste Bestellung',
      sub: 'Werde Teil der TIC-Community. Kein Spam — nur Drops, Deals & Brand-Stories.',
      placeholder: 'deine@email.de',
      cta: 'Jetzt 10 % sichern',
      thanks: 'Du bist dabei! Schau in dein Postfach — dein 10 %-Code ist unterwegs.',
      thanksTitle: 'Check dein Postfach',
      later: 'Vielleicht später',
    },
  };
  const c = copy[lang] || copy.en;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-dark-deep/70 backdrop-blur-sm z-[90]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative bg-dark-deep w-full max-w-md pointer-events-auto overflow-hidden grain-overlay">
              {/* Close */}
              <button onClick={dismiss} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
              </button>

              <div className="relative p-6 sm:p-10">
                {!submitted ? (
                  <>
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-px bg-cyan" />
                      <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">{c.eyebrow}</p>
                    </div>

                    {/* Big display headline */}
                    <h2 className="font-display uppercase leading-[0.85] text-6xl sm:text-7xl text-white mb-2">
                      <span className="text-cyan">10%</span><br />
                      {lang === 'de' ? 'RABATT' : 'OFF'}
                    </h2>

                    <p className="text-sm text-white/60 leading-relaxed mb-8 mt-6">{c.sub}</p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        <Input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder={c.placeholder}
                          className="pl-7 h-12 bg-transparent border-0 border-b border-white/30 text-white placeholder:text-white/30 rounded-none focus-visible:ring-0 focus-visible:border-cyan"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan text-dark-deep hover:bg-white text-[11px] tracking-[0.3em] uppercase py-5 mt-4"
                      >
                        {loading ? '...' : c.cta}
                      </Button>
                    </form>

                    <button onClick={dismiss} className="block mx-auto mt-6 text-[10px] text-white/30 hover:text-white/60 transition-colors tracking-[0.3em] uppercase">
                      {c.later}
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-cyan flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-6 h-6 text-dark-deep" />
                    </div>
                    <p className="text-[10px] tracking-[0.4em] uppercase text-cyan mb-3">{c.thanksTitle}</p>
                    <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto mt-2">{c.thanks}</p>
                    <Button onClick={dismiss} className="mt-8 bg-cyan text-dark-deep hover:bg-white text-[11px] tracking-[0.3em] uppercase px-10 py-5">
                      {lang === 'de' ? 'Jetzt shoppen' : 'Shop Now'}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}