import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function PaymentMethods() {
  const { t } = useLanguage();
  const methods = [
    { name: 'VISA', color: 'text-blue-600' },
    { name: 'Mastercard', color: 'text-red-500' },
    { name: 'AMEX', color: 'text-blue-400' },
    { name: 'PayPal', color: 'text-[#003087]', special: true },
    { name: 'Klarna', color: 'text-pink-600', special: true },
    { name: 'Apple Pay', color: 'text-dark', special: true },
    { name: 'Google Pay', color: 'text-blue-600', special: true },
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs tracking-[0.15em] uppercase text-gray-text">{t('footer.payments')}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {methods.map((method) => (
          <div key={method.name} className="h-7 px-2.5 bg-white rounded border border-border flex items-center justify-center">
            {method.name === 'PayPal' ? (
              <div className="flex items-center gap-0.5">
                <span className="font-bold text-[#003087] text-xs">pay</span>
                <span className="font-bold text-[#009cde] text-xs">pal</span>
              </div>
            ) : method.name === 'Klarna' ? (
              <span className="font-bold text-[#FF5800] text-[11px] tracking-wide">Klarna</span>
            ) : method.name === 'Apple Pay' ? (
              <span className={`font-bold text-[11px] tracking-wide ${method.color}`}>Apple Pay</span>
            ) : method.name === 'Google Pay' ? (
              <div className="flex items-center gap-0.5">
                <span className="font-bold text-blue-600 text-[11px]">G</span>
                <span className="font-bold text-red-500 text-[11px]">o</span>
                <span className="font-bold text-yellow-500 text-[11px]">o</span>
                <span className="font-bold text-blue-600 text-[11px]">g</span>
                <span className="font-bold text-green-600 text-[11px]">l</span>
                <span className="font-bold text-red-500 text-[11px]">e</span>
                <span className="font-bold text-dark text-[11px] ml-1">Pay</span>
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