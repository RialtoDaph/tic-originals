import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = ['shipping', 'method', 'payment', 'review'];

export default function Checkout() {
  const { t } = useLanguage();
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', houseNumber: '', postalCode: '', city: '', country: 'Deutschland',
    shippingMethod: 'standard', paymentMethod: 'stripe'
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0) return form.firstName && form.lastName && form.email && form.street && form.postalCode && form.city;
    return true;
  };

  const generateOrderNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `TIC-${new Date().getFullYear()}-${num}`;
  };

  const placeOrder = async () => {
    setIsSubmitting(true);
    const orderNumber = generateOrderNumber();
    const orderData = {
      order_number: orderNumber,
      status: 'confirmed',
      items: items.map(item => ({
        product_id: item.productId,
        product_name: item.productName,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.price
      })),
      subtotal,
      shipping_cost: shippingCost,
      total,
      vat_amount: total - (total / 1.19),
      customer_email: form.email,
      customer_name: `${form.firstName} ${form.lastName}`,
      customer_phone: form.phone,
      shipping_address: {
        first_name: form.firstName,
        last_name: form.lastName,
        street: form.street,
        house_number: form.houseNumber,
        postal_code: form.postalCode,
        city: form.city,
        country: form.country
      },
      shipping_method: form.shippingMethod,
      payment_method: form.paymentMethod,
      payment_status: 'paid'
    };
    await base44.entities.Order.create(orderData);
    clearCart();
    navigate(`/order-confirmation?order=${orderNumber}`);
    setIsSubmitting(false);
  };

  const stepLabels = [t('checkout.shipping'), t('checkout.method'), t('checkout.payment'), t('checkout.review')];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-text">{t('cart.empty')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-light text-center mb-12">{t('checkout.title')}</h1>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs tracking-[0.15em] uppercase text-gray-text">
            {stepLabels[step]}
          </p>
          <p className="text-xs text-gray-text">
            {step + 1} / {STEPS.length}
          </p>
        </div>
        <div className="h-0.5 w-full bg-border">
          <motion.div
            className="h-full bg-cyan"
            initial={false}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center mb-12">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i <= step ? 'bg-cyan text-dark-deep' : 'bg-muted text-gray-text'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs tracking-wider uppercase hidden sm:inline">{stepLabels[i]}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 sm:w-16 h-px mx-2 transition-colors ${i < step ? 'bg-cyan' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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

          {/* Step 1: Shipping Method */}
          {step === 1 && (
            <RadioGroup value={form.shippingMethod} onValueChange={v => updateField('shippingMethod', v)} className="space-y-4">
              <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${form.shippingMethod === 'standard' ? 'border-dark' : 'border-border'}`}>
                <RadioGroupItem value="standard" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('checkout.standard')}</p>
                  <p className="text-xs text-gray-text">DHL / Hermes</p>
                </div>
                <span className="text-sm">{subtotal >= 80 ? t('cart.free') : '€4.95'}</span>
              </label>
            </RadioGroup>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <RadioGroup value={form.paymentMethod} onValueChange={v => updateField('paymentMethod', v)} className="space-y-4">
              <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${form.paymentMethod === 'stripe' ? 'border-dark' : 'border-border'}`}>
                <RadioGroupItem value="stripe" />
                <div>
                  <p className="text-sm font-medium">{t('checkout.stripe')}</p>
                  <p className="text-xs text-gray-text">Visa, Mastercard, AMEX</p>
                </div>
              </label>
              <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${form.paymentMethod === 'paypal' ? 'border-dark' : 'border-border'}`}>
                <RadioGroupItem value="paypal" />
                <div>
                  <p className="text-sm font-medium">{t('checkout.paypal')}</p>
                </div>
              </label>
            </RadioGroup>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
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
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-none text-xs tracking-wider uppercase">
                {t('checkout.back')}
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-wider uppercase">
                {t('checkout.next')}
              </Button>
            ) : (
              <Button onClick={placeOrder} disabled={isSubmitting}
                className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-wider uppercase px-10">
                {isSubmitting ? '...' : t('checkout.placeOrder')}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-muted p-6 h-fit">
          <h3 className="text-xs tracking-wider uppercase mb-4">{t('cart.title')}</h3>
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div key={item.key} className="flex justify-between text-sm">
                <span className="text-gray-text">{item.productName} x{item.quantity}</span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
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
            <p className="text-xs text-gray-text">{t('products.inclVat')} (19%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}