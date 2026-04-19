import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

export default function StockBadge({ quantity, threshold = 3 }) {
  const { t } = useLanguage();

  if (quantity <= 0) {
    return <Badge variant="destructive" className="text-[10px] uppercase tracking-wider">{t('products.soldOut')}</Badge>;
  }
  if (quantity <= threshold) {
    return <Badge className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider">{t('products.lowStock')}</Badge>;
  }
  return <Badge className="bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider">{t('products.inStock')}</Badge>;
}