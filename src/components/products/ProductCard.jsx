import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import StockBadge from '@/components/common/StockBadge';
import PriceDisplay from '@/components/products/PriceDisplay';
import { useFlashSales } from '@/hooks/useFlashSales';
import { getFlashSaleForProduct } from '@/lib/flashSale';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, variant = 'default' }) {
  const { t, lang } = useLanguage();
  const totalStock = product.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;
  const [showQuickView, setShowQuickView] = useState(false);
  const { data: flashSales = [] } = useFlashSales();
  const flashSale = getFlashSaleForProduct(product, flashSales);

  // Card variant — used inside mobile horizontal scroll: white card, rounded, shadow, info inside card
  if (variant === 'card') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <Link to={`/products/${product.id}`} className="block">
            <div className="aspect-square bg-muted overflow-hidden relative">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                  <span className="font-display text-5xl text-cyan/30 tracking-[0.2em]">TIC</span>
                </div>
              )}
              {flashSale && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 font-medium">
                  {flashSale.discount_type === 'percentage' ? `-${flashSale.discount_value}%` : `-€${flashSale.discount_value}`}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-heading text-base font-semibold text-dark-deep leading-tight line-clamp-1">
                {product.name}
              </h3>
              <div className="mt-2 min-w-0">
                <PriceDisplay price={product.price} flashSale={flashSale} size="md" />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[10px] text-gray-text tracking-[0.15em] uppercase">{t('products.inclVat')}</p>
                <StockBadge quantity={totalStock} />
              </div>
            </div>
          </Link>
        </motion.div>
      </>
    );
  }

  // Default variant — desktop grid
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <div className="aspect-[3/4] bg-muted overflow-hidden mb-4 md:mb-5 relative">
          <Link to={`/products/${product.id}`} className="block w-full h-full">
            {product.images?.[0] ? (
              <>
                <img src={product.images[0]} alt={product.name}
                  className={`w-full h-full object-cover absolute inset-0 transition-all duration-[900ms] ease-out ${product.images?.[1] ? 'group-hover:opacity-0' : 'group-hover:scale-[1.04]'}`} />
                {product.images?.[1] && (
                  <img src={product.images[1]} alt={product.name}
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[900ms] ease-out" />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                <span className="font-display text-6xl text-cyan/30 tracking-[0.2em]">TIC</span>
              </div>
            )}
          </Link>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <StockBadge quantity={totalStock} />
            {flashSale && (
              <span className="bg-red-600 text-white text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 font-medium">
                {flashSale.discount_type === 'percentage' ? `-${flashSale.discount_value}%` : `-€${flashSale.discount_value}`}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowQuickView(true)}
            aria-label={lang === 'de' ? 'Schnellansicht' : 'Quick View'}
            className="hidden md:flex absolute top-3 right-3 w-9 h-9 items-center justify-center bg-white/90 hover:bg-cyan text-dark backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500">
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <Link to={`/products/${product.id}`} className="block">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-heading text-lg md:text-xl leading-tight tracking-tight truncate">{product.name}</h3>
            <div className="shrink-0">
              <PriceDisplay price={product.price} flashSale={flashSale} size="sm" />
            </div>
          </div>
          <p className="text-[11px] text-gray-text mt-1.5 tracking-[0.15em] uppercase">{t('products.inclVat')}</p>
        </Link>
      </motion.div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}