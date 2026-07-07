import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getPublicProducts } from '@/functions/getPublicProducts';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import ProductSkeleton from '@/components/products/ProductSkeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrentCollection } from '@/hooks/useCurrentCollection';

export default function Products() {
  const { t, lang } = useLanguage();
  const collection = useCurrentCollection();
  const [search, setSearch] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getPublicProducts({}).then(res => res.data.products),
  });

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchColor = colorFilter === 'all' || p.colors?.includes(colorFilter);
      const matchSize = sizeFilter === 'all' || p.sizes?.includes(sizeFilter);
      return matchSearch && matchColor && matchSize;
    });
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'stock') result = [...result].sort((a, b) => {
      const aStock = a.stock?.reduce((s, x) => s + x.quantity, 0) || 0;
      const bStock = b.stock?.reduce((s, x) => s + x.quantity, 0) || 0;
      return bStock - aStock;
    });
    return result;
  }, [products, search, colorFilter, sizeFilter, sortBy]);

  // Skip pseudo-color values (e.g. "3er-pack", "one-size") — only real colors for filter chips
  const isRealColor = (c) => c && !/pack|size|one-size/i.test(c);
  const allColors = [...new Set(products.flatMap(p => (p.colors || []).filter(isRealColor)))];
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))];

  const sortOptions = [
    { value: 'default', label: lang === 'de' ? 'Standard' : 'Default' },
    { value: 'price_asc', label: lang === 'de' ? 'Preis: Aufsteigend' : 'Price: Low to High' },
    { value: 'price_desc', label: lang === 'de' ? 'Preis: Absteigend' : 'Price: High to Low' },
    { value: 'name', label: lang === 'de' ? 'Name A-Z' : 'Name A-Z' },
    { value: 'stock', label: lang === 'de' ? 'Verfügbarkeit' : 'Availability' },
  ];

  const hasActiveFilter = colorFilter !== 'all' || sizeFilter !== 'all' || search;

  return (
    <div>
      {/* Editorial hero */}
      <section className="grain-overlay bg-dark-deep text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-12 pb-12 md:pt-28 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">TIC Originals</p>
            </div>
            <h1 className="font-display uppercase leading-[0.85] text-[16vw] md:text-[13vw] lg:text-[180px] text-white">
              THE <span className="text-cyan">SHOP</span>
            </h1>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <p className="text-xs tracking-[0.3em] uppercase text-white/60">
                {isLoading ? '...' : `${filtered.length} ${lang === 'de' ? 'Produkte' : 'Products'}`}
              </p>
              <p className="font-display text-2xl md:text-4xl text-cyan tracking-wider">COLLECTION {collection}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8 md:mb-14 pb-5 md:pb-6 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-text" />
            <Input
              placeholder={t('products.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-none border-0 border-b border-dark bg-transparent focus-visible:ring-0 focus-visible:border-cyan"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Color chips */}
            <button
              onClick={() => setColorFilter('all')}
              className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-all ${
                colorFilter === 'all' ? 'bg-dark-deep text-white' : 'border border-border hover:border-dark'
              }`}
            >
              {lang === 'de' ? 'Alle Farben' : 'All Colors'}
            </button>
            {allColors.map(c => (
              <button
                key={c}
                onClick={() => setColorFilter(colorFilter === c ? 'all' : c)}
                className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-all ${
                  colorFilter === c ? 'bg-dark-deep text-white' : 'border border-border hover:border-dark'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Size chips */}
            <button
              onClick={() => setSizeFilter('all')}
              className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-all ${
                sizeFilter === 'all' ? 'bg-dark-deep text-white' : 'border border-border hover:border-dark'
              }`}
            >
              {lang === 'de' ? 'Alle Größen' : 'All Sizes'}
            </button>
            {allSizes.map(s => (
              <button
                key={s}
                onClick={() => setSizeFilter(sizeFilter === s ? 'all' : s)}
                className={`min-w-[44px] px-3 py-2 text-[10px] tracking-[0.2em] uppercase transition-all ${
                  sizeFilter === s ? 'bg-dark-deep text-white' : 'border border-border hover:border-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-56 rounded-none border-0 border-b border-dark bg-transparent text-[10px] tracking-[0.2em] uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(o => <SelectItem key={o.value} value={o.value} className="text-[11px] tracking-wider uppercase">{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasActiveFilter && (
              <button
                onClick={() => { setSearch(''); setColorFilter('all'); setSizeFilter('all'); }}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-gray-text hover:text-dark"
              >
                <X className="w-3 h-3" /> {lang === 'de' ? 'Filter zurücksetzen' : 'Clear filters'}
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <ProductSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-6xl md:text-8xl text-gray-text/30 mb-4">0</p>
            <p className="text-xs tracking-[0.3em] uppercase text-gray-text">
              {lang === 'de' ? 'Keine Produkte gefunden' : 'No products found'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal snap scroll */}
            <div className="md:hidden -mx-5 px-5 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4">
              {filtered.map(product => (
                <div key={product.id} className="snap-start shrink-0 w-[75%]">
                  <ProductCard product={product} variant="card" />
                </div>
              ))}
              <div className="shrink-0 w-1" />
            </div>
            {/* Desktop: original grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}