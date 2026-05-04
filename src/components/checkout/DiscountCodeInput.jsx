import React, { useState } from 'react';
import { validateDiscount } from '@/functions/validateDiscount';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Tag } from 'lucide-react';

export default function DiscountCodeInput({ subtotal, customerEmail, onApply, onRemove, appliedCode, discountAmount, lang }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    const code = input.toUpperCase().trim();
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      const res = await validateDiscount({ code, subtotal, customer_email: customerEmail });
      const data = res?.data || {};
      if (!data.valid) {
        setError(data.error || (lang === 'de' ? 'Code ungültig' : 'Invalid code'));
        return;
      }
      onApply(data.code, data.discount_amount);
      setInput('');
    } catch (e) {
      setError(e?.message || 'Error');
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