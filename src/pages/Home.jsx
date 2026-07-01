import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getPublicProducts } from '@/functions/getPublicProducts';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import HeroSlider from '@/components/home/HeroSlider';
import ReviewsCarousel from '@/components/home/ReviewsCarousel';
import Marquee from '@/components/common/Marquee';

export default function Home() {
  const { t } = useLanguage();
  const { data: products = [] } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => getPublicProducts({}).then((res) => res.data.products.slice(0, 4))
  });

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Marquee ticker */}
      <div className="bg-dark-deep text-white py-4 border-y border-dark-light overflow-hidden">
        <Marquee />
      </div>

      {/* Products Preview */}
      {products.length > 0 &&
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-16 gap-6 flex-wrap">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-4">— Collection 001</p>
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9]">{t('products.title')}</h2>
            </div>
            <Link to="/products" className="text-xs tracking-[0.25em] uppercase flex items-center gap-2 hover:gap-4 transition-all border-b border-dark pb-1">
              {t('nav.shop')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) =>
          <ProductCard key={product.id} product={product} />
          )}
          </div>
        </section>
      }

      {/* Manifesto */}
      <section className="grain-overlay bg-dark-deep py-32 md:py-40 relative overflow-hidden">
        {/* Low opacity TIC watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display text-[10rem] md:text-[24rem] font-bold text-white/[0.04] leading-none tracking-widest">TIC</span>
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">Manifesto</p>
            </div>
            <blockquote className="font-heading text-2xl md:text-4xl lg:text-5xl text-white/95 font-light leading-[1.3] italic">
              "Cause sometimes you just feel tired. Feel weak, and when you feel weak. You feel like you wanna just give up. But you gotta search within you. Try to find that inner strength and just pull that shit out of you. And get that motivation to not give up. And not be a quitter. No matter how bad you wanna just fall flat on your face and COLLAPSE."
            </blockquote>
            <p className="font-display text-3xl md:text-5xl text-cyan uppercase tracking-wider mt-12">Till I Collapse.</p>
          </motion.div>
        </div>
      </section>

      {/* Shipping Info */}
      <ShippingInfo />
    </div>);

}

function ShippingInfo() {
  const { lang } = useLanguage();
  const items = [
  { title: lang === 'de' ? 'Kostenloser Versand' : 'Free Shipping', desc: lang === 'de' ? 'Ab €80 Bestellwert' : 'On orders over €80' },
  { title: lang === 'de' ? 'Schnelle Lieferung' : 'Fast Delivery', desc: '2-5 ' + (lang === 'de' ? 'Werktage' : 'business days') },
  { title: lang === 'de' ? '14 Tage Rückgabe' : '14-Day Returns', desc: lang === 'de' ? 'Widerrufsrecht' : 'Right of withdrawal' }];

  return (
    <section className="py-20 border-t">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {items.map((item, i) =>
        <div key={i}>
            <h3 className="font-heading text-xl mb-2">{item.title}</h3>
            <p className="text-sm text-gray-text">{item.desc}</p>
          </div>
        )}
      </div>
    </section>);

}