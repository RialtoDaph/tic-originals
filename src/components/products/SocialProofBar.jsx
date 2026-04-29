import React, { useState, useEffect } from 'react';
import { Flame, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SocialProofBar({ productName }) {
  const { lang } = useLanguage();
  const [viewers, setViewers] = useState(Math.floor(8 + Math.random() * 18));
  const [sold, setSold] = useState(Math.floor(20 + Math.random() * 60));

  // Randomly fluctuate viewers every 8-15s
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(v => Math.max(5, v + Math.floor(Math.random() * 5) - 2));
    }, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, []);

  const viewText = lang === 'de'
    ? `${viewers} Personen sehen sich das gerade an`
    : `${viewers} people viewing this right now`;

  const soldText = lang === 'de'
    ? `${sold} diese Woche verkauft`
    : `${sold} sold this week`;

  return (
    <div className="flex flex-col sm:flex-row gap-3 py-3 px-4 bg-muted/60 border border-border/50">
      <div className="flex items-center gap-2 text-xs text-gray-text">
        <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span>{viewText}</span>
      </div>
      <div className="hidden sm:block w-px bg-border" />
      <div className="flex items-center gap-2 text-xs text-gray-text">
        <Users className="w-3.5 h-3.5 text-cyan shrink-0" />
        <span>✅ {soldText}</span>
      </div>
    </div>
  );
}