import React from 'react';

export default function Marquee({ items = ['TILL I COLLAPSE', 'NO LIMITS', '1 WORLD', 'EST. 2026'], className = '' }) {
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className="inline-flex animate-marquee">
        {loop.map((t, i) => (
          <span key={i} className="font-display text-2xl sm:text-4xl md:text-6xl tracking-wider mx-5 sm:mx-8 flex items-center gap-5 sm:gap-8">
            {t}
            <span className="text-cyan text-xl sm:text-3xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}