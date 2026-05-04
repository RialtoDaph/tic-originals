import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1800&q=85&fit=crop',
    tag_en: 'New Collection',
    tag_de: 'Neue Kollektion',
    headline_en: 'TILL I\nCOLLAPSE',
    headline_de: 'TILL I\nCOLLAPSE',
    sub_en: 'Premium streetwear built for those who never give up.',
    sub_de: 'Premium Streetwear für alle, die niemals aufgeben.',
    cta_en: 'Shop Collection',
    cta_de: 'Kollektion entdecken',
    link: '/products',
    accent: 'from-dark-deep/90 via-dark-deep/50 to-transparent',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1800&q=85&fit=crop',
    tag_en: 'Limited Drops',
    tag_de: 'Limitierte Drops',
    headline_en: 'WEAR\nYOUR\nSTRENGTH',
    headline_de: 'TRAG\nDEINE\nSTÄRKE',
    sub_en: 'Each piece tells a story. Limited stock — move fast.',
    sub_de: 'Jedes Teil erzählt eine Geschichte. Limitiert — schnell sein.',
    cta_en: 'View Drops',
    cta_de: 'Drops ansehen',
    link: '/products',
    accent: 'from-dark-deep/80 via-dark-deep/40 to-transparent',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=1800&q=85&fit=crop',
    tag_en: 'TIC Originals',
    tag_de: 'TIC Originals',
    headline_en: 'BUILT\nDIFFERENT',
    headline_de: 'ANDERS\nGEMACHT',
    sub_en: 'Heavyweight fabric. Uncompromising quality. Made to outlast.',
    sub_de: 'Schweres Gewebe. Kompromisslose Qualität. Gebaut, um zu bleiben.',
    cta_en: 'Explore Now',
    cta_de: 'Jetzt erkunden',
    link: '/products',
    accent: 'from-dark-deep/85 via-dark-deep/30 to-transparent',
  },
];

const AUTOPLAY_DELAY = 5500;

export default function HeroSlider() {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const t = setTimeout(next, AUTOPLAY_DELAY);
    return () => clearTimeout(t);
  }, [current, next]);

  const slide = slides[current];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden bg-dark-deep">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-deep/70 via-transparent to-dark-deep/30" />

          {/* TIC watermark logo */}
          <div className="absolute inset-0 flex items-center justify-end pr-8 sm:pr-16 lg:pr-24 pointer-events-none select-none">
            <span className="font-heading text-[20vw] font-light tracking-[0.15em] text-white/[0.04] leading-none">
              TIC
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full min-h-[92vh] flex flex-col justify-end pb-20 px-8 sm:px-16 lg:px-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${slide.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Tag */}
            <p className="text-xs tracking-[0.4em] uppercase text-cyan mb-5">
              {lang === 'de' ? slide.tag_de : slide.tag_en}
            </p>

            {/* Headline */}
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-[7rem] text-white font-light leading-none tracking-[0.03em] whitespace-pre-line mb-6">
              {lang === 'de' ? slide.headline_de : slide.headline_en}
            </h1>

            {/* Sub */}
            <p className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed mb-10">
              {lang === 'de' ? slide.sub_de : slide.sub_en}
            </p>

            {/* CTA */}
            <Link to={slide.link}>
              <Button className="bg-cyan text-dark-deep hover:bg-cyan-dark px-10 py-6 text-xs tracking-[0.25em] uppercase rounded-none">
                {lang === 'de' ? slide.cta_de : slide.cta_en}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute bottom-10 right-8 sm:right-16 lg:right-24 flex items-center gap-4">
          {/* Dots */}
          <div className="flex gap-2 mr-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-8 h-1.5 bg-cyan' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={prev}
            className="w-10 h-10 border border-white/20 hover:border-cyan hover:text-cyan text-white/50 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 border border-white/20 hover:border-cyan hover:text-cyan text-white/50 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            key={`progress-${slide.id}`}
            className="h-full bg-cyan"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
          />
        </div>
      </div>
    </section>
  );
}