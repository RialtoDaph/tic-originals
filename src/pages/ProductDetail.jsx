import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { getPublicProducts } from '@/functions/getPublicProducts';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ArrowLeft, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StockBadge from '@/components/common/StockBadge';
import ProductReviews from '@/components/products/ProductReviews.jsx';
import SocialProofBar from '@/components/products/SocialProofBar';
import SizeGuideModal from '@/components/products/SizeGuideModal';
import RecentlyViewed, { trackProductView } from '@/components/products/RecentlyViewed';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetail() {
  const productId = window.location.pathname.split('/').pop();
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const ctaRef = useRef(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getPublicProducts({}).then(res => res.data.products),
  });

  const product = products.find(p => p.id === productId);

  // Track view & sticky CTA
  useEffect(() => {
    if (product) trackProductView(product);
  }, [product]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [product]);

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

  const allImages = product.images || [];

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || stockForSelection <= 0) return;
    addItem(product, selectedColor, selectedSize, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6 md:py-8 pb-28 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] md:text-xs text-gray-text mb-5 md:mb-8 overflow-hidden">
        <Link to="/" className="hover:text-dark transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-dark transition-colors">{t('nav.shop')}</Link>
        <span>/</span>
        <span className="text-dark">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images with zoom on hover */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="aspect-square bg-muted overflow-hidden relative group">
            <AnimatePresence mode="wait">
              {allImages.length > 0 ? (
                <motion.img
                  key={activeImage}
                  src={allImages[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep">
                  <span className="font-heading text-6xl text-cyan/20 tracking-[0.2em]">TIC</span>
                </div>
              )}
            </AnimatePresence>

            {/* Prev/next arrows for multiple images */}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setActiveImage(i => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveImage(i => (i + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`aspect-square bg-muted overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-dark' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-cyan" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">TIC Originals</p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.9] mb-6">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-6">
            <p className="font-display text-3xl md:text-4xl">€{product.price?.toFixed(2)}</p>
            <span className="text-[10px] tracking-[0.25em] uppercase text-gray-text">{t('products.inclVat')}</span>
          </div>
          <p className="text-gray-text text-sm leading-relaxed mb-8 max-w-md">
            {lang === 'de' ? product.description_de : product.description_en}
          </p>

          {/* Social Proof */}
          <div className="mb-6">
            <SocialProofBar productName={product.name} />
          </div>

          {/* Color Selector */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-text">{t('products.color')}</p>
              {selectedColor && <p className="text-[10px] tracking-[0.2em] uppercase">{selectedColor}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors?.map(color => (
                <button key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-5 py-3 text-[10px] tracking-[0.25em] uppercase transition-all ${
                    selectedColor === color ? 'bg-dark-deep text-white' : 'border border-border hover:border-dark-deep'
                  }`}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector with guide */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-text">{t('products.size')}</p>
              <button onClick={() => setShowSizeGuide(true)}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-gray-text hover:text-cyan transition-colors">
                <Ruler className="w-3 h-3" />
                {lang === 'de' ? 'Größentabelle' : 'Size Guide'}
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes?.map(size => {
                const stock = product.stock?.find(s => s.color === selectedColor && s.size === size);
                const qty = stock?.quantity ?? 0;
                const disabled = qty <= 0;
                return (
                  <button key={size}
                    onClick={() => !disabled && setSelectedSize(size)}
                    disabled={disabled}
                    className={`h-14 font-display text-lg tracking-wider uppercase transition-all ${
                      selectedSize === size ? 'bg-dark-deep text-white'
                        : disabled ? 'border border-border text-gray-text/40 cursor-not-allowed line-through'
                        : 'border border-border hover:border-dark-deep hover:bg-dark-deep hover:text-white'
                    }`}>
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Badge */}
          {selectedColor && selectedSize && stockForSelection !== null && (
            <div className="mb-6"><StockBadge quantity={stockForSelection} /></div>
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

          {/* CTA - observed for sticky */}
          <div ref={ctaRef}>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize || stockForSelection <= 0}
              className="w-full bg-dark-deep text-white hover:bg-cyan hover:text-dark-deep py-7 text-[11px] tracking-[0.3em] uppercase disabled:opacity-40 transition-colors"
            >
              {stockForSelection <= 0 && selectedColor && selectedSize ? t('products.soldOut') : t('products.addToCart')}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed currentProductId={productId} />

      <ProductReviews productId={productId} />

      {/* Size Guide Modal */}
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

      {/* Sticky Add to Cart Bar — sits above mobile nav on mobile, at bottom on desktop */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-[57px] lg:bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg px-4 py-3 flex items-center gap-4"
          >
            {product.images?.[0] && (
              <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover shrink-0 hidden sm:block" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm truncate">{product.name}</p>
              <p className="text-xs text-gray-text">€{product.price?.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize || stockForSelection <= 0}
              className="bg-cyan text-dark-deep hover:bg-cyan-dark text-xs tracking-[0.15em] uppercase px-6 py-5 shrink-0 disabled:opacity-40"
            >
              {!selectedColor || !selectedSize
                ? (lang === 'de' ? 'Option wählen' : 'Select Options')
                : stockForSelection <= 0 ? t('products.soldOut')
                : t('products.addToCart')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}