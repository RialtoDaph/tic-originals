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
      code: 'Use code TIC10 at checkout',
      thanks: "You're in. Use code TIC10 at checkout for 10% off!",
      later: 'Maybe later',
    },
    de: {
      eyebrow: 'Exklusives Angebot',
      headline: '10 % auf deine erste Bestellung',
      sub: 'Werde Teil der TIC-Community. Kein Spam — nur Drops, Deals & Brand-Stories.',
      placeholder: 'deine@email.de',
      cta: 'Jetzt 10 % sichern',
      code: 'Code TIC10 an der Kasse eingeben',
      thanks: 'Du bist dabei! Code TIC10 an der Kasse für 10 % Rabatt.',
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
            <div className="relative bg-dark-deep w-full max-w-md pointer-events-auto overflow-hidden">
              {/* Diagonal lines bg decoration */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg,#9EF2FF 0px,#9EF2FF 1px,transparent 1px,transparent 36px)' }}
              />

              {/* Close */}
              <button onClick={dismiss} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
              </button>

              <div className="relative p-8 sm:p-10">
                {!submitted ? (
                  <>
                    {/* Eyebrow */}
                    <div className="flex items-center gap-2 mb-6">
                      <Tag className="w-3.5 h-3.5 text-cyan" />
                      <p className="text-xs tracking-[0.3em] uppercase text-cyan">{c.eyebrow}</p>
                    </div>

                    {/* Big discount badge */}
                    <div className="mb-6">
                      <p className="font-heading text-7xl font-light text-white leading-none">10%</p>
                      <p className="font-heading text-2xl font-light text-white/70 -mt-1">{lang === 'de' ? 'RABATT' : 'OFF'}</p>
                    </div>

                    <h2 className="font-heading text-xl text-white font-light mb-2">{c.headline}</h2>
                    <p className="text-sm text-white/50 leading-relaxed mb-8">{c.sub}</p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder={c.placeholder}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-none focus-visible:ring-cyan"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-[0.2em] uppercase py-5"
                      >
                        {loading ? '...' : c.cta}
                      </Button>
                    </form>

                    <p className="text-center text-xs text-white/30 mt-4 tracking-wider">{c.code}</p>

                    <button onClick={dismiss} className="block mx-auto mt-4 text-xs text-white/30 hover:text-white/60 transition-colors tracking-wider">
                      {c.later}
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-cyan/20 flex items-center justify-center mx-auto mb-6">
                      <Tag className="w-7 h-7 text-cyan" />
                    </div>
                    <p className="font-heading text-5xl text-cyan mb-4">TIC10</p>
                    <p className="text-sm text-white/70 leading-relaxed">{c.thanks}</p>
                    <Button onClick={dismiss} className="mt-8 bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-[0.2em] uppercase px-10">
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