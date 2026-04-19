import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import StockBadge from '@/components/common/StockBadge';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  const { t, lang } = useLanguage();
  const totalStock = product.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square bg-muted overflow-hidden mb-4 relative">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
              <span className="font-heading text-4xl text-cyan/30 tracking-[0.2em]">TIC</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <StockBadge quantity={totalStock} />
          </div>
        </div>
        <h3 className="font-heading text-lg tracking-[0.1em] uppercase">{product.name}</h3>
        <p className="text-sm text-gray-text mt-1">
          {lang === 'de' ? product.description_de : product.description_en}
        </p>
        <p className="text-sm mt-2">
          €{product.price?.toFixed(2)} <span className="text-gray-text text-xs">{t('products.inclVat')}</span>
        </p>
      </Link>
    </motion.div>
  );
}