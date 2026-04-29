import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import StockBadge from '@/components/common/StockBadge';

export default function QuickViewModal({ product, onClose }) {
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const stockForSelection = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    const entry = product.stock?.find(s => s.color === selectedColor && s.size === selectedSize);
    return entry?.quantity ?? 0;
  }, [product, selectedColor, selectedSize]);

  const handleAdd = () => {
    if (!selectedColor || !selectedSize || stockForSelection <= 0) return;
    addItem(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Image */}
            <div className="aspect-square bg-muted">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                  <span className="font-heading text-4xl text-cyan/20">TIC</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs tracking-[0.25em] uppercase text-gray-text mb-1">TIC ORIGINALS</p>
                  <h2 className="font-heading text-2xl font-light">{product.name}</h2>
                  <p className="text-lg mt-1">€{product.price?.toFixed(2)}</p>
                </div>
                <button onClick={onClose} className="text-gray-text hover:text-dark p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-text leading-relaxed mb-4">
                {lang === 'de' ? product.description_de : product.description_en}
              </p>

              {/* Color */}
              <div className="mb-4">
                <p className="text-xs tracking-[0.15em] uppercase mb-2">{t('products.color')}</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors?.map(color => (
                    <button key={color}
                      onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                      className={`px-3 py-1.5 text-xs tracking-wider uppercase border transition-all ${
                        selectedColor === color ? 'border-dark bg-dark text-white' : 'border-border hover:border-dark'
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-4">
                <p className="text-xs tracking-[0.15em] uppercase mb-2">{t('products.size')}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map(size => {
                    const stock = product.stock?.find(s => s.color === selectedColor && s.size === size);
                    const qty = stock?.quantity ?? 0;
                    return (
                      <button key={size}
                        onClick={() => qty > 0 && setSelectedSize(size)}
                        disabled={qty <= 0}
                        className={`w-10 h-10 text-xs tracking-wider uppercase border transition-all ${
                          selectedSize === size ? 'border-dark bg-dark text-white'
                            : qty <= 0 ? 'border-border text-gray-text/40 cursor-not-allowed line-through'
                            : 'border-border hover:border-dark'
                        }`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedColor && selectedSize && stockForSelection !== null && (
                <div className="mb-4"><StockBadge quantity={stockForSelection} /></div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-muted">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center text-sm border-x">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAdd}
                disabled={!selectedColor || !selectedSize || stockForSelection <= 0}
                className={`w-full py-5 text-xs tracking-[0.2em] uppercase rounded-none transition-colors ${
                  added ? 'bg-green-500 hover:bg-green-500 text-white' : 'bg-cyan text-dark-deep hover:bg-cyan-dark'
                }`}
              >
                {added ? '✓ Added!' : t('products.addToCart')}
              </Button>

              <Link to={`/products/${product.id}`} onClick={onClose}
                className="flex items-center justify-center gap-1 mt-3 text-xs tracking-wider uppercase text-gray-text hover:text-dark transition-colors">
                View Full Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}