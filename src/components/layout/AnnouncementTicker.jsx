import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const messages = {
  en: [
    '🚚 Free Shipping on orders over €80',
    '🎁 Buy 3 Tees — Get a Boxer Set FREE',
    '⚡ Limited drops. Limited stock.',
    '💪 Till I Collapse — Never give up.',
    '📦 Fast delivery 2–5 business days',
  ],
  de: [
    '🚚 Kostenloser Versand ab €80',
    '🎁 3 Tees kaufen — Boxer Set GRATIS',
    '⚡ Limitierte Drops. Limitierter Bestand.',
    '💪 Till I Collapse — Gib niemals auf.',
    '📦 Schnelle Lieferung 2–5 Werktage',
  ],
};

export default function AnnouncementTicker() {
  const { lang } = useLanguage();
  const items = messages[lang] || messages.en;
  // duplicate for seamless loop
  const repeated = [...items, ...items];

  return (
    <div className="bg-dark-deep py-2 overflow-hidden relative">
      <div className="flex whitespace-nowrap animate-ticker">
        {repeated.map((msg, i) => (
          <span key={i} className="text-xs tracking-[0.18em] uppercase text-cyan mx-10 shrink-0">
            {msg}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 28s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}