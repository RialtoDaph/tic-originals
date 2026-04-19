import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function Products() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }),
  });

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchColor = colorFilter === 'all' || p.colors?.includes(colorFilter);
      const matchSize = sizeFilter === 'all' || p.sizes?.includes(sizeFilter);
      return matchSearch && matchColor && matchSize;
    });
  }, [products, search, colorFilter, sizeFilter]);

  const allColors = [...new Set(products.flatMap(p => p.colors || []))];
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-3">TIC ORIGINALS</p>
        <h1 className="font-heading text-5xl md:text-6xl font-light">{t('products.title')}</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-text" />
          <Input
            placeholder={t('products.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-none border-dark/20"
          />
        </div>
        <Select value={colorFilter} onValueChange={setColorFilter}>
          <SelectTrigger className="w-40 rounded-none">
            <SelectValue placeholder={t('products.color')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.all')}</SelectItem>
            {allColors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-40 rounded-none">
            <SelectValue placeholder={t('products.size')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.all')}</SelectItem>
            {allSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted mb-4" />
              <div className="h-4 bg-muted w-2/3 mb-2" />
              <div className="h-3 bg-muted w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-text py-20">{t('products.all')} — 0 {t('products.title').toLowerCase()}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}