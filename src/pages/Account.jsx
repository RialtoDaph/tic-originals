import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  returned: 'bg-gray-100 text-gray-600',
};

export default function Account() {
  const { lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u?.email) {
          const all = await base44.entities.Order.filter({ customer_email: u.email }, '-created_date', 20);
          setOrders(all);
        }
      } catch {
        base44.auth.redirectToLogin(window.location.href);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-text text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const copy = {
    en: { profile: 'Profile', orders: 'Orders', name: 'Name', email: 'Email', logout: 'Sign Out', noOrders: 'No orders yet.', order: 'Order', date: 'Date', total: 'Total', status: 'Status' },
    de: { profile: 'Profil', orders: 'Bestellungen', name: 'Name', email: 'E-Mail', logout: 'Abmelden', noOrders: 'Noch keine Bestellungen.', order: 'Bestellung', date: 'Datum', total: 'Gesamt', status: 'Status' },
  };
  const c = copy[lang] || copy.en;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-heading text-4xl font-light">
          {lang === 'de' ? 'Mein Konto' : 'My Account'}
        </h1>
        <Button variant="outline" onClick={() => base44.auth.logout()}
          className="rounded-none text-xs tracking-wider uppercase flex items-center gap-2">
          <LogOut className="w-3.5 h-3.5" />
          {c.logout}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-8">
        {['orders', 'profile'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs tracking-[0.15em] uppercase px-6 py-3 transition-colors border-b-2 -mb-px ${tab === t ? 'border-dark text-dark' : 'border-transparent text-gray-text hover:text-dark'}`}>
            {t === 'orders' ? c.orders : c.profile}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-4 p-6 border">
            <div className="w-14 h-14 bg-cyan/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-dark" />
            </div>
            <div>
              <p className="font-medium">{user?.full_name || '—'}</p>
              <p className="text-sm text-gray-text">{user?.email}</p>
            </div>
          </div>
          <div className="border p-6 space-y-4">
            <div>
              <p className="text-xs tracking-wider uppercase text-gray-text mb-1">{c.name}</p>
              <p className="text-sm">{user?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-gray-text mb-1">{c.email}</p>
              <p className="text-sm">{user?.email}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 mx-auto text-border mb-4" />
              <p className="text-sm text-gray-text">{c.noOrders}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-gray-text mt-0.5">
                        {new Date(order.created_date).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${statusColors[order.status] || 'bg-muted text-gray-text'}`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-medium">€{order.total?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-xs text-gray-text">
                        {item.product_name} — {item.color}/{item.size} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  {order.tracking_number && (
                    <p className="text-xs text-cyan mt-2">
                      {lang === 'de' ? 'Tracking' : 'Tracking'}: {order.tracking_number}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}