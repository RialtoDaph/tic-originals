import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmation() {
  const { t, lang } = useLanguage();
  const { clearCart } = useCart();

  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get('order');
  const sessionId = params.get('session_id'); // from Stripe redirect

  // Clear cart on confirmation page load (handles both Stripe and direct flows)
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-20 h-20 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <CheckCircle className="w-10 h-10 text-cyan-dark" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="font-heading text-4xl md:text-5xl font-light mb-4">{t('order.confirmation')}</h1>

        {orderNumber && (
          <div className="bg-muted inline-block px-6 py-3 mb-6">
            <p className="text-xs tracking-wider uppercase text-gray-text">{t('order.orderNumber')}</p>
            <p className="font-heading text-2xl mt-1">{orderNumber}</p>
          </div>
        )}

        <p className="text-gray-text max-w-md mx-auto mb-4">{t('order.thankYou')}</p>

        <p className="text-xs text-gray-text max-w-sm mx-auto mb-10">
          {lang === 'de'
            ? 'Du erhältst in Kürze eine Bestätigungs-E-Mail. Bitte überprüfe auch deinen Spam-Ordner.'
            : 'You will receive a confirmation email shortly. Please also check your spam folder.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/tracking">
            <Button variant="outline" className="rounded-none text-xs tracking-wider uppercase px-8">
              <Package className="w-4 h-4 mr-2" /> {t('order.trackOrder')}
            </Button>
          </Link>
          <Link to="/products">
            <Button className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-wider uppercase px-8">
              {t('order.backToShop')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}