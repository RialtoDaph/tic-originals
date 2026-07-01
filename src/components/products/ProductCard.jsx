import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import StockBadge from '@/components/common/StockBadge';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
  const { t, lang } = useLanguage();
  const totalStock = product.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <div className="aspect-[4/5] bg-muted overflow-hidden mb-5 relative">
          <Link to={`/products/${product.id}`}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                <span className="font-display text-6xl text-cyan/30 tracking-[0.2em]">TIC</span>
              </div>
            )}
          </Link>
          <div className="absolute inset-0 bg-dark-deep/0 group-hover:bg-dark-deep/10 transition-colors duration-500 pointer-events-none" />
          <div className="absolute top-3 right-3">
            <StockBadge quantity={totalStock} />
          </div>
          {/* Quick View Button */}
          <button
            onClick={() => setShowQuickView(true)}
            className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 bg-dark-deep hover:bg-cyan hover:text-dark-deep text-white text-[10px] tracking-[0.25em] uppercase px-4 py-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 whitespace-nowrap">
            <Eye className="w-3.5 h-3.5" />
            {lang === 'de' ? 'Schnellansicht' : 'Quick View'}
          </button>
        </div>
        <Link to={`/products/${product.id}`} className="block">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-xl md:text-2xl tracking-wider uppercase leading-tight">{product.name}</h3>
            <p className="text-sm font-medium tracking-wide shrink-0">€{product.price?.toFixed(2)}</p>
          </div>
          <p className="text-xs text-gray-text mt-2 tracking-wide">
            {lang === 'de' ? product.description_de : product.description_en}
          </p>
          <p className="text-[10px] text-gray-text/70 mt-1 tracking-[0.15em] uppercase">{t('products.inclVat')}</p>
        </Link>
      </motion.div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}