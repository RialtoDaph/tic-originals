import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import StockBadge from '@/components/common/StockBadge';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = window.location.pathname.split('/').pop();
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }),
  });

  const product = products.find(p => p.id === productId);

  const stockForSelection = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;
    const entry = product.stock?.find(s => s.color === selectedColor && s.size === selectedSize);
    return entry?.quantity ?? 0;
  }, [product, selectedColor, selectedSize]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="aspect-square max-w-xl bg-muted" />
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || stockForSelection <= 0) return;
    addItem(product, selectedColor, selectedSize, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-text hover:text-dark mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('nav.shop')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="aspect-square bg-muted overflow-hidden">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                <span className="font-heading text-6xl text-cyan/20 tracking-[0.2em]">TIC</span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="aspect-square bg-muted overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-2">TIC ORIGINALS</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light mb-4">{product.name}</h1>
          <p className="text-2xl mb-2">
            €{product.price?.toFixed(2)}
            <span className="text-sm text-gray-text ml-2">{t('products.inclVat')}</span>
          </p>
          <p className="text-gray-text text-sm leading-relaxed mb-8">
            {lang === 'de' ? product.description_de : product.description_en}
          </p>

          {/* Color Selector */}
          <div className="mb-6">
            <p className="text-xs tracking-[0.15em] uppercase mb-3">{t('products.color')}</p>
            <div className="flex gap-3">
              {product.colors?.map(color => (
                <button key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 text-xs tracking-wider uppercase border transition-all ${
                    selectedColor === color
                      ? 'border-dark bg-dark text-white'
                      : 'border-border hover:border-dark'
                  }`}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-6">
            <p className="text-xs tracking-[0.15em] uppercase mb-3">{t('products.size')}</p>
            <div className="flex gap-3">
              {product.sizes?.map(size => {
                const stock = product.stock?.find(s => s.color === selectedColor && s.size === size);
                const qty = stock?.quantity ?? 0;
                return (
                  <button key={size}
                    onClick={() => qty > 0 && setSelectedSize(size)}
                    disabled={qty <= 0}
                    className={`w-12 h-12 text-xs tracking-wider uppercase border transition-all ${
                      selectedSize === size
                        ? 'border-dark bg-dark text-white'
                        : qty <= 0
                          ? 'border-border text-gray-text/40 cursor-not-allowed line-through'
                          : 'border-border hover:border-dark'
                    }`}>
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Badge */}
          {selectedColor && selectedSize && stockForSelection !== null && (
            <div className="mb-6">
              <StockBadge quantity={stockForSelection} />
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-8">
            <p className="text-xs tracking-[0.15em] uppercase">{t('cart.quantity')}</p>
            <div className="flex items-center border">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-10 h-10 flex items-center justify-center text-sm border-x">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize || stockForSelection <= 0}
            className="w-full bg-cyan text-dark-deep hover:bg-cyan-dark py-6 text-xs tracking-[0.2em] uppercase rounded-none disabled:opacity-40"
          >
            {stockForSelection <= 0 && selectedColor && selectedSize ? t('products.soldOut') : t('products.addToCart')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}