import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function Footer() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    await base44.entities.NewsletterSubscriber.create({ email });
    toast({ title: '✓', description: t('footer.newsletter') });
    setEmail('');
  };

  return (
    <footer className="bg-dark-deep text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-heading text-3xl font-light tracking-[0.1em] mb-4">TIC ORIGINALS</h3>
            <p className="text-gray-text text-sm leading-relaxed max-w-md mb-8">
              Till I Collapse — Premium streetwear from Eichstätt, Germany.
            </p>
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
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-cyan">{t('footer.legal')}</h4>
            <div className="space-y-3">
              <Link to="/impressum" className="block text-sm text-gray-text hover:text-white transition-colors">{t('footer.impressum')}</Link>
              <Link to="/datenschutz" className="block text-sm text-gray-text hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <Link to="/agb" className="block text-sm text-gray-text hover:text-white transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-cyan">{t('footer.followUs')}</h4>
            <div className="space-y-3">
              <a href="https://instagram.com/tillicollapseoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-text hover:text-white transition-colors">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href="https://tiktok.com/@ticoriginals" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-text hover:text-white transition-colors">
                TikTok
              </a>
            </div>
            <div className="mt-8">
              <Link to="/tracking" className="text-sm text-gray-text hover:text-white transition-colors">
                {t('order.trackOrder')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-light mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-text">© {new Date().getFullYear()} TIC ORIGINALS. All rights reserved.</p>
          <p className="text-xs text-gray-text">An der Oberen Au 4, 85072 Eichstätt, Germany</p>
        </div>
      </div>
    </footer>
  );
}