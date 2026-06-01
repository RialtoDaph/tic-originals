import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Music2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PaymentMethods from '@/components/common/PaymentMethods';

export default function Footer() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    // Generate a random token for unsubscribe link verification
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await base44.entities.NewsletterSubscriber.create({ email, unsubscribe_token: token });
    toast({ title: '✓', description: t('footer.newsletter') });
    setEmail('');
  };

  return (
    <footer className="bg-dark-deep text-white relative overflow-hidden">
      {/* Low opacity TIC watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-heading text-[8rem] md:text-[20rem] font-bold text-white/[0.03] leading-none tracking-widest">TIC</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-heading text-3xl font-light tracking-[0.1em] mb-4">TIC ORIGINALS</h3>
            <p className="text-gray-text text-sm leading-relaxed max-w-md mb-8">
              {t('footer.tagline')}
            </p>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-4 text-cyan">{t('footer.newsletterHeading')}</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-dark border-dark-light text-white placeholder:text-gray-text"
              />
              <Button type="submit" className="bg-cyan text-dark-deep hover:bg-cyan-dark shrink-0 text-xs tracking-wider uppercase">
                {t('footer.subscribe')}
              </Button>
            </form>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-cyan">{t('footer.service')}</h4>
            <div className="space-y-3">
              <Link to="/tracking" className="block text-sm text-gray-text hover:text-white transition-colors">{t('order.trackOrder')}</Link>
              <Link to="/contact" className="block text-sm text-gray-text hover:text-white transition-colors">{t('nav.contact')}</Link>
              <Link to="/faq" className="block text-sm text-gray-text hover:text-white transition-colors">{t('nav.faq')}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-cyan">{t('footer.legal')}</h4>
            <div className="space-y-3">
              <Link to="/impressum" className="block text-sm text-gray-text hover:text-white transition-colors">{t('footer.impressum')}</Link>
              <Link to="/datenschutz" className="block text-sm text-gray-text hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <Link to="/agb" className="block text-sm text-gray-text hover:text-white transition-colors">{t('footer.terms')}</Link>
              <Link to="/widerruf" className="block text-sm text-gray-text hover:text-white transition-colors">Widerruf</Link>
            </div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 mt-8 text-cyan">{t('footer.followUs')}</h4>
            <div className="space-y-3">
              <a href="https://instagram.com/tillicollapseoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-text hover:text-white transition-colors">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href="https://tiktok.com/@ticoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-text hover:text-white transition-colors">
                <Music2 className="w-4 h-4" /> TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-light mt-12 pt-8 space-y-4">
          <PaymentMethods />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-text">© {new Date().getFullYear()} TIC ORIGINALS. All rights reserved.</p>
            <p className="text-xs text-gray-text">An der Oberen Au 4, 85072 Eichstätt, Germany</p>
          </div>
        </div>
      </div>
    </footer>
  );
}