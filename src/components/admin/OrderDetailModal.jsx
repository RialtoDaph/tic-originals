import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Package, CreditCard, Truck } from 'lucide-react';

export default function OrderDetailModal({ order, open, onOpenChange }) {
  if (!order) return null;
  const addr = order.shipping_address || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-wider">{order.order_number}</DialogTitle>
          <p className="text-xs text-gray-text">
            {order.created_date ? format(new Date(order.created_date), 'dd.MM.yyyy · HH:mm') : '-'}
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 bg-muted rounded-full uppercase tracking-wider">Status: {order.status}</span>
            <span className={`px-3 py-1 rounded-full uppercase tracking-wider ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              Payment: {order.payment_status}
            </span>
          </div>

          <section>
            <h3 className="text-xs tracking-[0.2em] uppercase text-gray-text mb-3 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Customer
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customer_name || '—'}</p>
              <p className="text-gray-text break-all">{order.customer_email}</p>
              {order.customer_phone && (
                <p className="text-gray-text flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {order.customer_phone}
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs tracking-[0.2em] uppercase text-gray-text mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Shipping Address
            </h3>
            <div className="text-sm space-y-0.5">
              <p>{addr.first_name} {addr.last_name}</p>
              <p>{addr.street} {addr.house_number}</p>
              {addr.address_line_2 && <p>{addr.address_line_2}</p>}
              <p>{addr.postal_code} {addr.city}</p>
              <p>{addr.country}</p>
            </div>
          </section>

          <section>
            <h3 className="text-xs tracking-[0.2em] uppercase text-gray-text mb-3 flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> Items ({(order.items || []).length})
            </h3>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm border-b border-black/[0.06] pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-gray-text">
                      {[item.color, item.size].filter(Boolean).join(' · ')} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">€{((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-text">Subtotal</span>
              <span>€{(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount {order.applied_discount_code ? `(${order.applied_discount_code})` : ''}</span>
                <span>−€{order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-text">Shipping</span>
              <span>€{(order.shipping_cost || 0).toFixed(2)}</span>
            </div>
            {order.vat_amount > 0 && (
              <div className="flex justify-between text-xs text-gray-text">
                <span>incl. VAT</span>
                <span>€{order.vat_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-base pt-2 border-t">
              <span>Total</span>
              <span>€{(order.total || 0).toFixed(2)}</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 text-xs text-gray-text border-t pt-4">
            <div>
              <p className="uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Payment</p>
              <p className="text-dark">{order.payment_method || '—'}</p>
            </div>
            <div>
              <p className="uppercase tracking-wider mb-1 flex items-center gap-1.5"><Truck className="w-3 h-3" /> Shipping</p>
              <p className="text-dark">{order.shipping_carrier || '—'}</p>
              {order.tracking_number && <p className="mt-1 break-all">Track: {order.tracking_number}</p>}
            </div>
          </section>

          {order.notes && (
            <section className="border-t pt-4">
              <h3 className="text-xs tracking-[0.2em] uppercase text-gray-text mb-2">Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}