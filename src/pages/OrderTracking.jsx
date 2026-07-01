import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getOrderByNumber } from '@/functions/getOrderByNumber';
import { Input } from '@/components/ui/input';
import { Package, Truck, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const statusIcons = { pending: Clock, confirmed: CheckCircle, processing: Package, shipped: Truck, delivered: CheckCircle };

export default function OrderTracking() {
  const { t, lang } = useLanguage();
  const [orderNum, setOrderNum] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async () => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await getOrderByNumber({ order_number: orderNum.trim() });
      if (res?.data?.found) setOrder(res.data.order);
      else { setNotFound(true); setOrder(null); }
    } catch {
      setNotFound(true);
      setOrder(null);
    }
    setLoading(false);
  };

  const currentIdx = order ? statusFlow.indexOf(order.status) : -1;

  return (
    <div>
      {/* Hero */}
      <section className="grain-overlay bg-dark-deep text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">— {t('tracking.title')}</p>
            </div>
            <h1 className="font-display uppercase leading-[0.85] text-6xl md:text-8xl lg:text-9xl">
              {lang === 'de' ? 'Wo ist' : 'Where is'}<br />
              <span className="text-cyan">{lang === 'de' ? 'meine Ware?' : 'my order?'}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 md:py-20">
        {/* Search */}
        <div className="mb-14">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-3">— {t('tracking.enterOrder')}</p>
          <div className="flex items-end gap-3 border-b border-dark">
            <Input
              placeholder="TIC-2026-XXXXXX"
              value={orderNum}
              onChange={e => setOrderNum(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
              className="rounded-none border-0 bg-transparent px-0 h-14 text-base md:text-lg focus-visible:ring-0"
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="pb-4 text-[10px] tracking-[0.3em] uppercase text-dark-deep hover:text-cyan flex items-center gap-2 shrink-0 disabled:opacity-40"
            >
              {loading ? '...' : (lang === 'de' ? 'Suchen' : 'Track')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {notFound && (
            <p className="text-sm text-destructive mt-4 tracking-wide">{t('tracking.notFound')}</p>
          )}
        </div>

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              {/* Header card */}
              <div className="bg-dark-deep text-white p-6 md:p-8 grain-overlay">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[10px] tracking-[0.35em] uppercase text-cyan mb-2">— {t('order.orderNumber')}</p>
                    <p className="font-display text-2xl md:text-3xl tracking-wider">{order.order_number}</p>
                  </div>
                  <span className="bg-cyan text-dark-deep px-4 py-2 text-[10px] tracking-[0.3em] uppercase">
                    {t(`status.${order.status}`)}
                  </span>
                </div>
                {order.tracking_number && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-white/50">{t('tracking.trackingNumber')}</p>
                    <p className="text-sm mt-2 text-cyan">{order.shipping_carrier}: {order.tracking_number}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-6">— {lang === 'de' ? 'Fortschritt' : 'Progress'}</p>
                <div>
                  {statusFlow.map((status, i) => {
                    const Icon = statusIcons[status];
                    const isActive = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <div key={status} className="flex items-start gap-5">
                        <div className="flex flex-col items-center">
                          <div className={`w-11 h-11 flex items-center justify-center transition-all ${
                            isCurrent ? 'bg-cyan text-dark-deep' :
                            isActive ? 'bg-dark-deep text-white' :
                            'border border-border text-gray-text'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {i < statusFlow.length - 1 && (
                            <div className={`w-px h-12 ${isActive ? 'bg-dark-deep' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="pt-3">
                          <p className={`font-display text-lg uppercase tracking-wide ${isActive ? '' : 'text-gray-text'}`}>
                            {t(`status.${status}`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-border pt-8">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-5">— Items</p>
                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-4 py-2">
                      <div className="min-w-0">
                        <p className="text-sm truncate">{item.product_name}</p>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-text">{item.color} / {item.size} · x{item.quantity}</p>
                      </div>
                      <span className="font-display text-lg shrink-0">€{(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-baseline pt-4 mt-4 border-t border-border">
                  <span className="text-[10px] tracking-[0.3em] uppercase">{t('cart.total')}</span>
                  <span className="font-display text-3xl">€{order.total?.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}