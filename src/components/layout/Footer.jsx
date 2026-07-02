import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Music2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { subscribeNewsletter } from '@/functions/subscribeNewsletter';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import PaymentMethods from '@/components/common/PaymentMethods';
import Marquee from '@/components/common/Marquee';

export default function Footer() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    await subscribeNewsletter({ email });
    toast({ title: '✓', description: t('footer.newsletter') });
    setEmail('');
  };

  return (
    <footer className="grain-overlay bg-dark-deep text-white relative overflow-hidden">
      {/* Marquee top */}
      <div className="border-y border-dark-light py-5">
        <Marquee items={['TILL I COLLAPSE', 'NO LIMITS', 'NO EXCUSES', '1 WORLD', 'BORN IN GERMANY']} />
      </div>

      {/* Newsletter block */}
      <div className="border-b border-dark-light">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-20 grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] tracking-[0.4em] uppercase text-cyan mb-3 md:mb-4">{t('footer.newsletterHeading')}</p>
            <h3 className="font-display text-3xl sm:text-4xl md:text-6xl uppercase leading-[0.9] text-white">
              {lang === 'de' ? 'Sei der Erste.' : 'Be the first.'}<br />
              <span className="text-outline text-white">{lang === 'de' ? 'Drop 002.' : 'Drop 002.'}</span>
            </h3>
          </div>
          <form onSubmit={handleSubscribe} className="col-span-12 md:col-span-7 flex items-end">
            <div className="flex-1 flex items-end border-b border-white/30 gap-3">
              <Input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent border-0 text-white placeholder:text-white/40 text-base md:text-lg h-14 px-0 focus-visible:ring-0 rounded-none"
              />
              <button type="submit" className="pb-4 text-[10px] tracking-[0.3em] uppercase text-cyan flex items-center gap-2 hover:gap-4 transition-all shrink-0">
                {t('footer.subscribe')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase mb-6 text-cyan">Shop</h4>
            <div className="space-y-3">
              <Link to="/products" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('nav.shop')}</Link>
              <Link to="/tracking" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('order.trackOrder')}</Link>
              <Link to="/account" className="block text-sm text-white/70 hover:text-cyan transition-colors">
                {lang === 'de' ? 'Mein Konto' : 'My Account'}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase mb-6 text-cyan">{t('footer.service')}</h4>
            <div className="space-y-3">
              <Link to="/contact" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('nav.contact')}</Link>
              <Link to="/faq" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('nav.faq')}</Link>
              <Link to="/about" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('nav.about')}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase mb-6 text-cyan">{t('footer.legal')}</h4>
            <div className="space-y-3">
              <Link to="/impressum" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('footer.impressum')}</Link>
              <Link to="/datenschutz" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('footer.privacy')}</Link>
              <Link to="/agb" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('footer.terms')}</Link>
              <Link to="/widerruf" className="block text-sm text-white/70 hover:text-cyan transition-colors">{t('footer.withdrawal')}</Link>
              <Link to="/returns-policy" className="block text-sm text-white/70 hover:text-cyan transition-colors">{lang === 'de' ? 'Rückgabe' : 'Returns'}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase mb-6 text-cyan">{t('footer.followUs')}</h4>
            <div className="space-y-3">
              <a href="https://instagram.com/tillicollapseoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-cyan transition-colors">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href="https://tiktok.com/@ticoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-cyan transition-colors">
                <Music2 className="w-4 h-4" /> TikTok
              </a>
            </div>
            <div className="mt-8 text-xs text-white/40 leading-relaxed">
              An der Oberen Au 4<br />
              85072 Eichstätt<br />
              Germany
            </div>
          </div>
        </div>
      </div>

      {/* Oversized brand statement */}
      <div className="border-t border-dark-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <h2 className="font-display text-[14vw] md:text-[15vw] lg:text-[200px] leading-[0.85] uppercase text-white/[0.08] select-none pointer-events-none text-center md:text-left md:whitespace-nowrap">
            TILL I COLLAPSE
          </h2>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-light pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <PaymentMethods />
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 pt-2">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">
              © {new Date().getFullYear()} TIC Originals. {lang === 'de' ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">EST. 2026 · 1 WORLD.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}