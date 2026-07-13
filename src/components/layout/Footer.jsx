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
        <Marquee items={['TILL I COLLAPSE', 'NO LIMITS', '1 WORLD', 'BORN IN GERMANY', 'EST. 2026']} />
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
              <a href="https://www.tiktok.com/@tillicollapseoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-cyan transition-colors">
                <Music2 className="w-4 h-4" /> TikTok
              </a>
              <a href="https://pinterest.com/tillicollapseoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-cyan transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg> Pinterest
              </a>
              <a href="https://chat.whatsapp.com/EqURZfTVdA6JiUoDXsPdku" target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp Community"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-cyan transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg> Community
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