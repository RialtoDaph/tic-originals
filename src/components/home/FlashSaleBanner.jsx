import React, { useState, useEffect } from 'react';
import { useFlashSales } from '@/hooks/useFlashSales';
import { getNearestExpiringFlashSale, endOfDayMs } from '@/lib/flashSale';
import { useLanguage } from '@/context/LanguageContext';
import { Zap } from 'lucide-react';

// Countdown boxes for HH / MM / SS.
function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl md:text-4xl leading-none tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-white/70 mt-1">{label}</span>
    </div>
  );
}

export default function FlashSaleBanner() {
  const { lang } = useLanguage();
  const { data: flashSales = [] } = useFlashSales();
  const nearest = getNearestExpiringFlashSale(flashSales);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!nearest) return;
    const tick = () => {
      const diff = endOfDayMs(nearest.valid_until) - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nearest]);

  if (!nearest || !timeLeft) return null;

  const badge = nearest.discount_type === 'percentage'
    ? `${nearest.discount_value}% OFF`
    : `€${nearest.discount_value} OFF`;

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-5 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 relative z-10">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 md:w-6 md:h-6 fill-white" />
          <div className="text-left">
            <p className="font-display text-xl md:text-2xl uppercase leading-tight tracking-wider">
              {lang === 'de' ? 'Flash Sale' : 'Flash Sale'} · {badge}
            </p>
            <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/85">
              {lang === 'de' ? 'Endet in' : 'Ends in'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          {timeLeft.days > 0 && <TimeBox value={timeLeft.days} label={lang === 'de' ? 'Tage' : 'Days'} />}
          <TimeBox value={timeLeft.hours} label={lang === 'de' ? 'Std' : 'Hrs'} />
          <TimeBox value={timeLeft.minutes} label={lang === 'de' ? 'Min' : 'Min'} />
          <TimeBox value={timeLeft.seconds} label={lang === 'de' ? 'Sek' : 'Sec'} />
        </div>
      </div>
    </div>
  );
}