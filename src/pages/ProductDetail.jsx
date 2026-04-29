import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ArrowLeft, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StockBadge from '@/components/common/StockBadge';
import ProductReviews from '@/components/products/ProductReviews';
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
    queryFn: () => base44.entities.Product.filter({ is_active: true }),
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-text mb-8">
        <Link to="/" className="hover:text-dark transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-dark transition-colors">{t('nav.shop')}</Link>
        <span>/</span>
        <span className="text-dark">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
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
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-2">TIC ORIGINALS</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light mb-4">{product.name}</h1>
          <p className="text-2xl mb-2">
            €{product.price?.toFixed(2)}
            <span className="text-sm text-gray-text ml-2">{t('products.inclVat')}</span>
          </p>
          <p className="text-gray-text text-sm leading-relaxed mb-6">
            {lang === 'de' ? product.description_de : product.description_en}
          </p>

          {/* Social Proof */}
          <div className="mb-6">
            <SocialProofBar productName={product.name} />
          </div>

          {/* Color Selector */}
          <div className="mb-6">
            <p className="text-xs tracking-[0.15em] uppercase mb-3">{t('products.color')}</p>
            <div className="flex flex-wrap gap-3">
              {product.colors?.map(color => (
                <button key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 text-xs tracking-wider uppercase border transition-all ${
                    selectedColor === color ? 'border-dark bg-dark text-white' : 'border-border hover:border-dark'
                  }`}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector with guide */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-[0.15em] uppercase">{t('products.size')}</p>
              <button onClick={() => setShowSizeGuide(true)}
                className="flex items-center gap-1 text-xs text-gray-text hover:text-dark transition-colors">
                <Ruler className="w-3 h-3" />
                {lang === 'de' ? 'Größentabelle' : 'Size Guide'}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes?.map(size => {
                const stock = product.stock?.find(s => s.color === selectedColor && s.size === size);
                const qty = stock?.quantity ?? 0;
                return (
                  <button key={size}
                    onClick={() => qty > 0 && setSelectedSize(size)}
                    disabled={qty <= 0}
                    className={`w-12 h-12 text-xs tracking-wider uppercase border transition-all ${
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

          {/* CTA — observed for sticky */}
          <div ref={ctaRef}>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize || stockForSelection <= 0}
              className="w-full bg-cyan text-dark-deep hover:bg-cyan-dark py-6 text-xs tracking-[0.2em] uppercase rounded-none disabled:opacity-40"
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

      {/* Sticky Add to Cart Bar */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg px-4 py-3 flex items-center gap-4"
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
              className="bg-cyan text-dark-deep hover:bg-cyan-dark text-xs tracking-[0.15em] uppercase rounded-none px-6 py-5 shrink-0 disabled:opacity-40"
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