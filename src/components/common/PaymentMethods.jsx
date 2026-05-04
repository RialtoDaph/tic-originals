import React from 'react';

export default function PaymentMethods() {
  const methods = [
    { name: 'VISA', color: 'text-blue-600' },
    { name: 'Mastercard', color: 'text-red-500' },
    { name: 'AMEX', color: 'text-blue-400' },
    { name: 'PayPal', color: 'text-[#003087]', special: true },
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs tracking-[0.15em] uppercase text-gray-text">Zahlungsarten</span>
      <div className="flex flex-wrap items-center gap-2">
        {methods.map((method) => (
          <div key={method.name} className="h-9 px-4 bg-white rounded border border-border flex items-center justify-center">
            {method.special ? (
              <div className="flex items-center gap-0.5">
                <span className="font-bold text-[#003087] text-xs">pay</span>
                <span className="font-bold text-[#009cde] text-xs">pal</span>
              </div>
            ) : (
              <span className={`font-bold text-[11px] tracking-wide ${method.color}`}>{method.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}