import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicBundles } from '@/functions/getPublicBundles';
import { useLanguage } from '@/context/LanguageContext';
import BundleCard from './BundleCard';

export default function BundleSection() {
  const { lang } = useLanguage();
  const { data: bundles = [] } = useQuery({
    queryKey: ['public-bundles'],
    queryFn: () => getPublicBundles({}).then((res) => res.data.bundles || []),
  });

  if (!bundles.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 md:py-24 border-t">
      <div className="mb-10 md:mb-14">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-cyan" />
          <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">
            {lang === 'de' ? 'Sparen im Set' : 'Save with sets'}
          </p>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-7xl uppercase leading-[0.9]">
          Bundles
        </h2>
      </div>
      {/* Mobile: horizontal snap scroll — matches Products preview above */}
      <div className="md:hidden -mx-5 px-5 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4">
        {bundles.map((b) => (
          <div key={b.id} className="snap-start shrink-0 w-[80%]">
            <BundleCard bundle={b} />
          </div>
        ))}
        <div className="shrink-0 w-1" />
      </div>
      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {bundles.map((b) => <BundleCard key={b.id} bundle={b} />)}
      </div>
    </section>
  );
}