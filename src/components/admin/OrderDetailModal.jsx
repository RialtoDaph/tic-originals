import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Package, CreditCard, Truck, Check, FileDown, Send } from 'lucide-react';
import { generateInvoicePDF } from '@/functions/generateInvoicePDF';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function OrderDetailModal({ order, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(order?.status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(order?.payment_status || 'pending');
  const [carrier, setCarrier] = useState(order?.shipping_carrier || 'DHL');
  const [tracking, setTracking] = useState(order?.tracking_number || '');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [invoiceMsg, setInvoiceMsg] = useState('');

  // Sync form when opening a different order
  useEffect(() => {
    if (order) {
      setStatus(order.status || 'pending');
      setPaymentStatus(order.payment_status || 'pending');
      setCarrier(order.shipping_carrier || 'DHL');
      setTracking(order.tracking_number || '');
      setSavedFlash(false);
    }
  }, [order?.id]);

  if (!order) return null;
  const addr = order.shipping_address || {};

  const dirty =
    status !== (order.status || 'pending') ||
    paymentStatus !== (order.payment_status || 'pending') ||
    carrier !== (order.shipping_carrier || 'DHL') ||
    tracking !== (order.tracking_number || '');

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Order.update(order.id, {
      status,
      payment_status: paymentStatus,
      shipping_carrier: carrier,
      tracking_number: tracking,
    });
    await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    setInvoiceMsg('');
    try {
      const res = await generateInvoicePDF(
        { order_id: order.id, action: 'download' },
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rechnung-${order.order_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setInvoiceMsg('Download failed: ' + (err.message || 'unknown error'));
    }
    setDownloading(false);
  };

  const handleSendInvoice = async () => {
    setSending(true);
    setInvoiceMsg('');
    try {
      const res = await generateInvoicePDF({ order_id: order.id, action: 'send' });
      const data = res.data || {};
      if (data.test_mode) {
        setInvoiceMsg(`✓ Sent to test address (${data.sent_to}) — not to customer.`);
      } else {
        setInvoiceMsg(`✓ Invoice sent to ${data.sent_to}`);
      }
    } catch (err) {
      setInvoiceMsg('Send failed: ' + (err.message || 'unknown error'));
    }
    setSending(false);
  };

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

          {/* Editable controls */}
          <section className="border rounded-lg p-4 bg-muted/30 space-y-3">
            <h3 className="text-xs tracking-[0.2em] uppercase text-gray-text">Manage Order</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-text block mb-1">Order status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-text block mb-1">Payment status</label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="text-xs text-gray-text block mb-1">Carrier</label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DHL">DHL</SelectItem>
                    <SelectItem value="DPD">DPD</SelectItem>
                    <SelectItem value="Hermes">Hermes</SelectItem>
                    <SelectItem value="UPS">UPS</SelectItem>
                    <SelectItem value="GLS">GLS</SelectItem>
                    <SelectItem value="Deutsche Post">Deutsche Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-text block mb-1">Tracking number</label>
                <Input
                  placeholder="Tracking #"
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {savedFlash && (
                <span className="text-xs text-green-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!dirty || saving}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </section>

          {/* Rechnung / Invoice */}
          <section className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-gray-text">Rechnung</h3>
              <p className="text-xs text-gray-text mt-1">
                Test mode aktiv — E-Mails gehen an <span className="font-medium text-dark">altodaphino@gmail.com</span>, nicht an den Kunden.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleDownloadInvoice} disabled={downloading}>
                <FileDown className="w-4 h-4" /> {downloading ? 'Generating…' : 'Download PDF'}
              </Button>
              <Button size="sm" onClick={handleSendInvoice} disabled={sending}>
                <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send invoice'}
              </Button>
            </div>
            {invoiceMsg && (
              <p className={`text-xs ${invoiceMsg.startsWith('✓') ? 'text-green-700' : 'text-red-600'}`}>
                {invoiceMsg}
              </p>
            )}
          </section>

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