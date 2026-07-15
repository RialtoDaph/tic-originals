import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, subtotal, shippingCost, vatAmount, total, isOpen, setIsOpen } = useCart();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
    setIsOpen(false);
  };

  const progress = Math.min((subtotal / 80) * 100, 100);
  const remaining = Math.max(0, 80 - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-deep/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white z-50 flex flex-col pt-safe"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-border">
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-gray-text">{t('cart.title')}</p>
                <p className="font-display text-2xl uppercase mt-0.5">{items.length} {lang === 'de' ? 'Artikel' : 'Items'}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 -mr-2 flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <ShoppingBag className="w-8 h-8 text-gray-text" />
                </div>
                <p className="font-display text-3xl uppercase mb-3">{lang === 'de' ? 'Leer.' : 'Empty.'}</p>
                <p className="text-sm text-gray-text mb-8 max-w-xs">{t('cart.empty')}</p>
                <Link
                  to="/products"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 bg-dark-deep text-white px-8 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-cyan hover:text-dark-deep transition-colors group"
                >
                  {lang === 'de' ? 'Shop entdecken' : 'Explore Shop'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-6 py-5 space-y-5">
                  {items.map(item => (
                    <div key={item.key} className="flex gap-4 pb-5 border-b border-border last:border-0">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-24 h-28 object-cover bg-muted shrink-0" />
                      ) : (
                        <div className="w-24 h-28 bg-gradient-to-br from-dark to-dark-deep flex items-center justify-center shrink-0">
                          <span className="font-display text-xl text-cyan/40">TIC</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-lg uppercase leading-tight truncate">{item.productName}</h4>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="w-8 h-8 -mt-1 -mr-1 flex items-center justify-center text-gray-text hover:text-destructive transition-colors shrink-0"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] tracking-[0.25em] uppercase text-gray-text mt-1">
                          {item.color} / {item.size}
                        </p>
                        <div className="flex items-end justify-between mt-auto pt-3">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-9 h-9 flex items-center justify-center text-xs border-x border-border">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-display text-lg">€{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-5 sm:px-6 py-5 space-y-4 pb-safe">
                  {/* Free shipping progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-gray-text">
                        {subtotal >= 80
                          ? (lang === 'de' ? '✓ Kostenloser Versand' : '✓ Free Shipping Unlocked')
                          : `€${remaining.toFixed(2)} ${lang === 'de' ? 'bis Gratisversand' : 'to Free Shipping'}`}
                      </p>
                      <p className="text-[10px] text-gray-text">{Math.round(progress)}%</p>
                    </div>
                    <div className="h-1 bg-border overflow-hidden">
                      <div
                        className="h-full bg-cyan transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-text">{t('cart.subtotal')}</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-text">{t('cart.shipping')}</span>
                      <span>{shippingCost === 0 ? t('cart.free') : `€${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-text">{t('products.vat')}</span>
                      <span>€{vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-3 border-t border-border">
                      <span className="text-[10px] tracking-[0.3em] uppercase">{t('cart.total')}</span>
                      <span className="font-display text-3xl">€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="flex items-center justify-center gap-2 w-full bg-dark-deep text-white py-5 text-[11px] tracking-[0.3em] uppercase hover:bg-cyan hover:text-dark-deep transition-colors group"
                  >
                    {t('cart.checkout')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}