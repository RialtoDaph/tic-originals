import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getOrderByNumber } from '@/functions/getOrderByNumber';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Truck, CheckCircle, Clock, Search } from 'lucide-react';

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const statusIcons = { pending: Clock, confirmed: CheckCircle, processing: Package, shipped: Truck, delivered: CheckCircle };

export default function OrderTracking() {
  const { t } = useLanguage();
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
      if (res?.data?.found) {
        setOrder(res.data.order);
      } else {
        setNotFound(true);
        setOrder(null);
      }
    } catch {
      setNotFound(true);
      setOrder(null);
    }
    setLoading(false);
  };

  const currentIdx = order ? statusFlow.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-3">TIC ORIGINALS</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light">{t('tracking.title')}</h1>
      </div>

      <div className="flex gap-3 mb-12">
        <Input
          placeholder={t('tracking.enterOrder')}
          value={orderNum}
          onChange={e => setOrderNum(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          className="rounded-none"
        />
        <Button onClick={handleTrack} disabled={loading}
          className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none px-8 shrink-0">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {notFound && <p className="text-center text-gray-text">{t('tracking.notFound')}</p>}

      {order && (
        <div className="space-y-8">
          <div className="bg-muted p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs tracking-wider uppercase text-gray-text">{t('order.orderNumber')}</p>
                <p className="font-heading text-xl">{order.order_number}</p>
              </div>
              <span className="bg-cyan/10 text-dark px-3 py-1 text-xs tracking-wider uppercase">
                {t(`status.${order.status}`)}
              </span>
            </div>
            {order.tracking_number && (
              <div>
                <p className="text-xs tracking-wider uppercase text-gray-text">{t('tracking.trackingNumber')}</p>
                <p className="text-sm mt-1">{order.shipping_carrier}: {order.tracking_number}</p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="space-y-0">
            {statusFlow.map((status, i) => {
              const Icon = statusIcons[status];
              const isActive = i <= currentIdx;
              return (
                <div key={status} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-cyan text-dark-deep' : 'bg-muted text-gray-text'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {i < statusFlow.length - 1 && (
                      <div className={`w-px h-8 ${isActive ? 'bg-cyan' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm ${isActive ? 'font-medium' : 'text-gray-text'}`}>
                      {t(`status.${status}`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Items */}
          <div className="border-t pt-6">
            <h3 className="text-xs tracking-wider uppercase text-gray-text mb-4">Items</h3>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span>{item.product_name} ({item.color}/{item.size}) x{item.quantity}</span>
                <span>€{(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-medium pt-2 border-t mt-2">
              <span>{t('cart.total')}</span>
              <span>€{order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}