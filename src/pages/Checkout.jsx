import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
// Note: order creation, stock validation, and order_number generation all happen
// server-side in createCheckoutSession — the client no longer touches those.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import DiscountCodeInput from '@/components/checkout/DiscountCodeInput.jsx';
import PaymentMethods from '@/components/common/PaymentMethods';
import { motion } from 'framer-motion';

const STEPS = ['shipping', 'review'];

export default function Checkout() {
  const { t, lang } = useLanguage();
  const { items, subtotal, shippingCost, total } = useCart();
  const { user, authChecked } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', houseNumber: '', postalCode: '', city: '', country: 'Deutschland',
    shippingMethod: 'standard', paymentMethod: 'stripe',
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0) return form.firstName && form.lastName && form.email && form.street && form.postalCode && form.city;
    return true;
  };

  const placeOrder = async () => {
    setIsSubmitting(true);
    setCheckoutError('');

    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      setCheckoutError(
        lang === 'de'
          ? 'Checkout funktioniert nur in der veröffentlichten App.'
          : 'Checkout only works from the published app.'
      );
      setIsSubmitting(false);
      return;
    }

    // Save shipping address to localStorage for next checkout
    try {
      localStorage.setItem(`tic_address_${form.email}`, JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        street: form.street,
        houseNumber: form.houseNumber,
        postalCode: form.postalCode,
        city: form.city,
        country: form.country,
      }));
    } catch (e) { /* ignore quota errors */ }

    // We send the origin only — server builds the final success_url with the
    // generated order_number so we don't need a client-side placeholder.
    const successBase = `${window.location.origin}/order-confirmation`;
    const cancelUrl = `${window.location.origin}/checkout`;

    // Server creates order + generates order_number + validates stock/prices
    let res;
    try {
      res = await createCheckoutSession({
        items: items.map(i => ({
          productId: i.productId,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
        })),
        discount_amount: discountAmount,
        applied_discount_code: appliedCode || undefined,
        customer_email: form.email,
        customer_name: `${form.firstName} ${form.lastName}`,
        customer_phone: form.phone,
        language: lang,
        shipping_address: {
          first_name: form.firstName,
          last_name: form.lastName,
          street: form.street,
          house_number: form.houseNumber,
          postal_code: form.postalCode,
          city: form.city,
          country: form.country,
        },
        shipping_method: form.shippingMethod,
        payment_method: form.paymentMethod,
        success_url: successBase,
        cancel_url: cancelUrl,
      });
    } catch (err) {
      setCheckoutError(
        err?.response?.data?.error || err?.message ||
        (lang === 'de'
          ? 'Checkout fehlgeschlagen. Bitte erneut versuchen.'
          : 'Checkout failed. Please try again.')
      );
      setIsSubmitting(false);
      return;
    }

    if (!res?.data?.url) {
      setCheckoutError(lang === 'de' ? 'Keine Checkout-URL erhalten.' : 'No checkout URL received.');
      setIsSubmitting(false);
      return;
    }

    // Cart is cleared on /order-confirmation when payment succeeds.
    window.location.href = res.data.url;
  };

  const stepLabels = [t('checkout.shipping'), t('checkout.review')];

  // Pre-fill from logged-in user + last saved address (localStorage → last order fallback)
  useEffect(() => {
    if (!user?.email) return;

    const loadSavedData = async () => {
      // 1. Try localStorage first (fastest)
      let saved = null;
      try {
        const raw = localStorage.getItem(`tic_address_${user.email}`);
        if (raw) saved = JSON.parse(raw);
      } catch (e) { /* ignore */ }

      // 2. Fallback: load from user's last order
      if (!saved) {
        try {
          const orders = await base44.entities.Order.filter(
            { customer_email: user.email },
            '-created_date',
            1
          );
          if (orders?.[0]?.shipping_address) {
            const addr = orders[0].shipping_address;
            saved = {
              firstName: addr.first_name || '',
              lastName: addr.last_name || '',
              phone: orders[0].customer_phone || '',
              street: addr.street || '',
              houseNumber: addr.house_number || '',
              postalCode: addr.postal_code || '',
              city: addr.city || '',
              country: addr.country || 'Deutschland',
            };
          }
        } catch (e) { /* ignore */ }
      }

      setForm(prev => ({
        ...prev,
        email: user.email,
        firstName: prev.firstName || saved?.firstName || (user.full_name ? user.full_name.split(' ')[0] : ''),
        lastName: prev.lastName || saved?.lastName || (user.full_name ? user.full_name.split(' ').slice(1).join(' ') : ''),
        phone: prev.phone || saved?.phone || '',
        street: prev.street || saved?.street || '',
        houseNumber: prev.houseNumber || saved?.houseNumber || '',
        postalCode: prev.postalCode || saved?.postalCode || '',
        city: prev.city || saved?.city || '',
        country: prev.country || saved?.country || 'Deutschland',
      }));
    };

    loadSavedData();
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center flex flex-col items-center">
        <ShoppingBag className="w-12 h-12 text-gray-text mb-4" />
        <h1 className="font-display text-4xl uppercase mb-2">{t('checkout.title')}</h1>
        <p className="text-gray-text mb-6">{t('cart.empty')}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-dark-deep text-white px-8 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-cyan hover:text-dark-deep transition-colors"
        >
          {lang === 'de' ? 'Zum Shop' : 'Go to Shop'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-16">
      <div className="mb-10 md:mb-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-cyan" />
          <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">Checkout</p>
        </div>
        <h1 className="font-display uppercase leading-[0.9] text-5xl md:text-7xl">{t('checkout.title')}</h1>
      </div>

      {/* Stepper */}
      <div className="mb-10 md:mb-14 flex items-center gap-3 md:gap-6">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 flex items-center justify-center text-xs font-display transition-all ${
                i <= step ? 'bg-dark-deep text-white' : 'border border-border text-gray-text'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : `0${i + 1}`}
              </div>
              <span className={`text-[10px] tracking-[0.25em] uppercase ${i <= step ? 'text-dark-deep' : 'text-gray-text'}`}>{stepLabels[i]}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border relative">
                <motion.div
                  className="absolute inset-0 bg-dark-deep origin-left"
                  initial={false}
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs tracking-wider uppercase">{t('checkout.firstName')}</Label>
                  <Input value={form.firstName} onChange={e => updateField('firstName', e.target.value)} className="rounded-none mt-1" />
                </div>
                <div>
                  <Label className="text-xs tracking-wider uppercase">{t('checkout.lastName')}</Label>
                  <Input value={form.lastName} onChange={e => updateField('lastName', e.target.value)} className="rounded-none mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">{t('checkout.email')}</Label>
                <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className="rounded-none mt-1" />
                <p className="text-xs text-gray-text mt-1">
                  {lang === 'de' ? 'Wir senden dir die Bestellbestätigung an diese E-Mail.' : "We'll send your order confirmation to this email."}
                </p>
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">{t('checkout.phone')}</Label>
                <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} className="rounded-none mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label className="text-xs tracking-wider uppercase">{t('checkout.street')}</Label>
                  <Input value={form.street} onChange={e => updateField('street', e.target.value)} className="rounded-none mt-1" />
                </div>
                <div>
                  <Label className="text-xs tracking-wider uppercase">{t('checkout.houseNumber')}</Label>
                  <Input value={form.houseNumber} onChange={e => updateField('houseNumber', e.target.value)} className="rounded-none mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs tracking-wider uppercase">{t('checkout.postalCode')}</Label>
                  <Input value={form.postalCode} onChange={e => updateField('postalCode', e.target.value)} className="rounded-none mt-1" />
                </div>
                <div>
                  <Label className="text-xs tracking-wider uppercase">{t('checkout.city')}</Label>
                  <Input value={form.city} onChange={e => updateField('city', e.target.value)} className="rounded-none mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">{t('checkout.country')}</Label>
                <Input value={form.country} disabled className="rounded-none mt-1 bg-muted" />
              </div>
            </div>
          )}

          {/* Step 1: Review + Payment Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border p-4">
                <h3 className="text-xs tracking-wider uppercase mb-3 text-gray-text">{t('checkout.shipping')}</h3>
                <p className="text-sm">{form.firstName} {form.lastName}</p>
                <p className="text-sm text-gray-text">{form.street} {form.houseNumber}, {form.postalCode} {form.city}</p>
                <p className="text-sm text-gray-text">{form.email}</p>
              </div>
              <div className="border p-4 space-y-3">
                <h3 className="text-xs tracking-wider uppercase mb-3 text-gray-text">Items</h3>
                {items.map(item => (
                  <div key={item.key} className="flex justify-between text-sm">
                    <span>{item.productName} ({item.color}/{item.size}) x{item.quantity}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <PaymentMethods />
              <div className="bg-muted/40 border p-5 text-sm">
                <p className="font-medium mb-1">
                  {lang === 'de' ? 'Sichere Zahlung über Stripe' : 'Secure payment via Stripe'}
                </p>
                <p className="text-xs text-gray-text leading-relaxed">
                  {lang === 'de'
                    ? 'Du wirst zu unserem Zahlungsanbieter weitergeleitet. Dort kannst du mit Kreditkarte (Visa, Mastercard, AMEX) oder PayPal bezahlen.'
                    : 'You will be redirected to our payment provider where you can pay with card (Visa, Mastercard, AMEX) or PayPal.'}
                </p>
              </div>
            </div>
          )}

          {/* Checkout Error */}
          {checkoutError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
              {checkoutError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-none text-xs tracking-wider uppercase">
                {t('checkout.back')}
              </Button>
            ) : <div />}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-wider uppercase">
                {t('checkout.next')}
              </Button>
            ) : (
              <Button onClick={placeOrder} disabled={isSubmitting}
                className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-wider uppercase px-10">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {lang === 'de' ? 'Wird verarbeitet…' : 'Processing…'}
                  </span>
                ) : t('checkout.placeOrder')}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-muted p-6 h-fit space-y-4">
          <h3 className="text-xs tracking-wider uppercase">{t('cart.title')}</h3>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.key} className="flex justify-between text-sm">
                <span className="text-gray-text">{item.productName} x{item.quantity}</span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Discount Code Input */}
          <DiscountCodeInput
            subtotal={subtotal}
            customerEmail={form.email}
            lang={lang}
            appliedCode={appliedCode}
            discountAmount={discountAmount}
            onApply={(code, amount) => {
              setAppliedCode(code);
              setDiscountAmount(amount);
            }}
            onRemove={() => {
              setAppliedCode('');
              setDiscountAmount(0);
            }}
          />

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-text">{t('cart.subtotal')}</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-text">{t('cart.shipping')}</span>
              <span>{shippingCost === 0 ? t('cart.free') : `€${shippingCost.toFixed(2)}`}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>{lang === 'de' ? 'Rabatt' : 'Discount'} ({appliedCode})</span>
                <span>−€{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>{t('cart.total')}</span>
              <span>€{Math.max(0, total - discountAmount).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-text">{t('products.inclVat')} (19%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}