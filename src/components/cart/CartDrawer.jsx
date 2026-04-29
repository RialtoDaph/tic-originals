import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, subtotal, shippingCost, total, isOpen, setIsOpen } = useCart();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-heading text-2xl">{t('cart.title')}</h2>
              <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-text text-sm">{t('cart.empty')}</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.map(item => (
                    <div key={item.key} className="flex gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-20 h-20 object-cover bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.productName}</h4>
                        <p className="text-xs text-gray-text mt-0.5">{item.color} / {item.size}</p>
                        <p className="text-sm font-medium mt-1">€{item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="w-6 h-6 border flex items-center justify-center hover:bg-muted">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="w-6 h-6 border flex items-center justify-center hover:bg-muted">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeItem(item.key)} className="ml-auto text-gray-text hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-6 space-y-3">
                  {/* Free shipping upsell progress bar */}
                  {subtotal < 80 && (
                    <div className="bg-muted p-3 mb-1">
                      <p className="text-xs text-gray-text mb-2">
                        {subtotal >= 60
                          ? `🎉 ${(80 - subtotal).toFixed(2)}€ ${t('cart.freeShippingNote')}`
                          : `🚚 ${t('cart.freeShippingNote')}`}
                      </p>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min((subtotal / 80) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-right text-gray-text mt-1">€{subtotal.toFixed(2)} / €80</p>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-text">{t('cart.subtotal')}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-text">{t('cart.shipping')}</span>
                    <span>{shippingCost === 0 ? t('cart.free') : `€${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t('cart.total')}</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <Link to="/checkout" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-cyan text-dark-deep hover:bg-cyan-dark mt-2 text-xs tracking-[0.15em] uppercase">
                      {t('cart.checkout')}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}