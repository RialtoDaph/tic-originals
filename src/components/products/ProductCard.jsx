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
        <div className="aspect-square bg-muted overflow-hidden mb-4 relative">
          <Link to={`/products/${product.id}`}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                <span className="font-heading text-4xl text-cyan/30 tracking-[0.2em]">TIC</span>
              </div>
            )}
          </Link>
          <div className="absolute top-3 right-3">
            <StockBadge quantity={totalStock} />
          </div>
          {/* Quick View Button */}
          <button
            onClick={() => setShowQuickView(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 hover:bg-white text-dark text-xs tracking-[0.15em] uppercase px-4 py-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap shadow">
            <Eye className="w-3.5 h-3.5" />
            {lang === 'de' ? 'Schnellansicht' : 'Quick View'}
          </button>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-heading text-lg tracking-[0.1em] uppercase">{product.name}</h3>
          <p className="text-sm text-gray-text mt-1">
            {lang === 'de' ? product.description_de : product.description_en}
          </p>
          <p className="text-sm mt-2">
            €{product.price?.toFixed(2)} <span className="text-gray-text text-xs">{t('products.inclVat')}</span>
          </p>
        </Link>
      </motion.div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}