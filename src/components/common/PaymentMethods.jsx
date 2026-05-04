import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentMethods() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-xs tracking-[0.15em] uppercase text-gray-text mb-2">Zahlungsarten</span>
        <div className="flex items-center gap-3">
          {/* PayPal Logo */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded border border-border">
            <span className="font-bold text-[#003087] text-xs">pay</span>
            <span className="font-bold text-[#009cde] text-xs">pal</span>
          </div>
          {/* Kreditkarte */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded border border-border">
            <CreditCard className="w-4 h-4 text-dark" />
            <span className="text-xs text-dark font-medium">Visa</span>
          </div>
        </div>
      </div>
    </div>
  );
}