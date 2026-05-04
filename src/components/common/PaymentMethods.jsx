import React from 'react';

export default function PaymentMethods() {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs tracking-[0.15em] uppercase text-gray-text">Zahlungsarten</span>
      <div className="flex flex-wrap items-center gap-2">
        {/* Visa */}
        <div className="px-3 py-2 bg-white rounded border border-border">
          <span className="text-xs font-bold text-blue-600">VISA</span>
        </div>
        {/* Mastercard */}
        <div className="px-3 py-2 bg-white rounded border border-border">
          <span className="text-xs font-bold text-red-500">Mastercard</span>
        </div>
        {/* AMEX */}
        <div className="px-3 py-2 bg-white rounded border border-border">
          <span className="text-xs font-bold text-blue-400">AMEX</span>
        </div>
        {/* PayPal */}
        <div className="px-3 py-2 bg-white rounded border border-border flex items-center gap-1">
          <span className="font-bold text-[#003087] text-xs">pay</span>
          <span className="font-bold text-[#009cde] text-xs">pal</span>
        </div>
      </div>
    </div>
  );
}