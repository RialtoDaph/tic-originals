import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Tag } from 'lucide-react';

// Returns { discountAmount, codeRecord } or throws with a user-facing error message
export async function validateDiscountCode(code, subtotal, customerEmail) {
  const allCodes = await base44.entities.DiscountCode.list();
  const record = allCodes.find(c => c.code === code.toUpperCase().trim());

  if (!record) throw new Error('Code nicht gefunden / Code not found');
  if (!record.is_active) throw new Error('Dieser Code ist nicht aktiv / Code is not active');

  const today = new Date().toISOString().split('T')[0];
  if (record.valid_from && today < record.valid_from) throw new Error('Code ist noch nicht gültig / Code not valid yet');
  if (record.valid_until && today > record.valid_until) throw new Error('Code ist abgelaufen / Code has expired');

  if (record.usage_limit != null && record.used_count >= record.usage_limit) {
    throw new Error('Code wurde zu oft verwendet / Code usage limit reached');
  }

  if (record.minimum_order_amount > 0 && subtotal < record.minimum_order_amount) {
    throw new Error(`Mindestbestellwert €${record.minimum_order_amount} nicht erreicht / Min. order €${record.minimum_order_amount} not met`);
  }

  if (record.is_first_order_only && customerEmail) {
    const prevOrders = await base44.entities.Order.list();
    const hasPrevious = prevOrders.some(o => o.customer_email === customerEmail && o.payment_status === 'paid');
    if (hasPrevious) throw new Error('Code nur für Erstbestellungen / First order only');
  }

  let discountAmount = 0;
  if (record.discount_type === 'percentage') {
    discountAmount = (subtotal * record.discount_value) / 100;
    if (record.maximum_discount_amount) discountAmount = Math.min(discountAmount, record.maximum_discount_amount);
  } else {
    discountAmount = Math.min(record.discount_value, subtotal);
  }

  return { discountAmount: Math.round(discountAmount * 100) / 100, codeRecord: record };
}

export default function DiscountCodeInput({ subtotal, customerEmail, onApply, onRemove, appliedCode, discountAmount, lang }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await validateDiscountCode(input, subtotal, customerEmail);
      onApply(input.toUpperCase().trim(), result.discountAmount, result.codeRecord);
      setInput('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div>
            <span className="font-mono text-sm font-bold text-green-800">{appliedCode}</span>
            <span className="text-xs text-green-700 ml-2">−€{discountAmount.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={onRemove} className="text-green-700 hover:text-green-900 transition-colors">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-text" />
          <Input
            value={input}
            onChange={e => { setInput(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            placeholder={lang === 'de' ? 'Rabattcode' : 'Discount code'}
            className="rounded-none pl-8 text-sm font-mono"
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={loading || !input.trim()}
          variant="outline"
          className="rounded-none text-xs tracking-wider uppercase border-dark hover:bg-muted"
        >
          {loading ? '...' : (lang === 'de' ? 'Anwenden' : 'Apply')}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}