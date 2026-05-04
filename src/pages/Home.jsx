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

export default function Home() {
  const { t } = useLanguage();
  const { data: products = [] } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => getPublicProducts({}).then(res => res.data.products.slice(0, 4)),
  });

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Products Preview */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-3">Collection</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light">{t('products.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-16">
            <Link to="/products">
              <Button variant="outline" className="px-10 py-6 text-xs tracking-[0.2em] uppercase rounded-none border-dark">
                {t('nav.shop')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Manifesto */}
      <section className="bg-dark-deep py-32 relative overflow-hidden">
        {/* Low opacity TIC watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-heading text-[20rem] font-bold text-white/[0.03] leading-none tracking-widest">TIC</span>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-cyan mb-8">Manifesto</p>
            <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed italic">
              "Cause sometimes you just feel tired... But you gotta search within you, try to find that inner strength and just pull that shit out of you. And get that motivation to not give up."
            </blockquote>
            <div className="mt-8 w-12 h-px bg-cyan mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Shipping Info */}
      <ShippingInfo />
    </div>
  );
}

function ShippingInfo() {
  const { lang } = useLanguage();
  const items = [
    { title: lang === 'de' ? 'Kostenloser Versand' : 'Free Shipping', desc: lang === 'de' ? 'Ab €80 Bestellwert' : 'On orders over €80' },
    { title: lang === 'de' ? 'Schnelle Lieferung' : 'Fast Delivery', desc: '2-5 ' + (lang === 'de' ? 'Werktage' : 'business days') },
    { title: lang === 'de' ? '14 Tage Rückgabe' : '14-Day Returns', desc: lang === 'de' ? 'Widerrufsrecht' : 'Right of withdrawal' },
  ];
  return (
    <section className="py-20 border-t">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {items.map((item, i) => (
          <div key={i}>
            <h3 className="font-heading text-xl mb-2">{item.title}</h3>
            <p className="text-sm text-gray-text">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}