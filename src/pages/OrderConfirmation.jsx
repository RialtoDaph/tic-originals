import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Package, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmation() {
  const { t, lang } = useLanguage();
  const { clearCart } = useCart();

  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get('order');
  const sessionId = params.get('session_id');

  useEffect(() => {
    if (sessionId) clearCart();
  }, [sessionId]);

  return (
    <div className="min-h-[calc(100vh-4rem)] grain-overlay bg-dark-deep text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 py-16 md:py-24">
        <div className="w-full max-w-3xl">
          {/* Success mark */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.7 }}
            className="w-20 h-20 md:w-24 md:h-24 bg-cyan flex items-center justify-center mx-auto mb-10"
          >
            <Check className="w-10 h-10 md:w-12 md:h-12 text-dark-deep" strokeWidth={3} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">
                {lang === 'de' ? 'Bestellung erhalten' : 'Order Received'}
              </p>
              <div className="w-8 h-px bg-cyan" />
            </div>

            <h1 className="font-display uppercase leading-[0.85] text-6xl md:text-8xl lg:text-9xl mb-8">
              {lang === 'de' ? 'Danke.' : 'Thank you.'}
            </h1>

            <p className="text-white/60 max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
              {t('order.thankYou')}
            </p>

            {orderNumber && (
              <div className="inline-block border border-cyan/40 px-8 py-5 mb-10">
                <p className="text-[10px] tracking-[0.4em] uppercase text-cyan mb-2">{t('order.orderNumber')}</p>
                <p className="font-display text-2xl md:text-3xl tracking-wider">{orderNumber}</p>
              </div>
            )}

            <p className="text-xs text-white/40 max-w-sm mx-auto mb-12 leading-relaxed">
              {lang === 'de'
                ? 'Du erhältst in Kürze eine Bestätigungs-E-Mail. Bitte überprüfe auch deinen Spam-Ordner.'
                : 'You will receive a confirmation email shortly. Please also check your spam folder.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/tracking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:border-cyan hover:text-cyan transition-colors"
              >
                <Package className="w-4 h-4" /> {t('order.trackOrder')}
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan text-dark-deep px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-white transition-colors group"
              >
                {t('order.backToShop')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center">
        <p className="font-display text-lg md:text-xl uppercase tracking-widest text-white/30">
          TILL I COLLAPSE · EST. 2024
        </p>
      </div>
    </div>
  );
}