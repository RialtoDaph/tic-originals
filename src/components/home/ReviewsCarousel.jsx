import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';

// Fallback reviews if no data in DB yet
const FALLBACK_REVIEWS = [
  {
    id: 'f1',
    author_name: 'Marcus K.',
    rating: 5,
    comment: 'Absolutely love the quality. Heavyweight fabric, perfect fit. This is my 3rd order.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop&crop=face',
  },
  {
    id: 'f2',
    author_name: 'Sophie L.',
    rating: 5,
    comment: 'Das Material ist unglaublich. Genau was ich gesucht habe, limitiert und besonders.',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80&fit=crop&crop=face',
  },
  {
    id: 'f3',
    author_name: 'Jayden R.',
    rating: 5,
    comment: 'Wore it to the gym and got so many compliments. The "Till I Collapse" energy is real.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80&fit=crop&crop=face',
  },
  {
    id: 'f4',
    author_name: 'Lea M.',
    rating: 4,
    comment: 'Super schnelle Lieferung und tolle Verarbeitung. Werde definitiv wieder bestellen!',
    photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80&fit=crop&crop=face',
  },
  {
    id: 'f5',
    author_name: 'Chris T.',
    rating: 5,
    comment: 'Premium streetwear that actually feels premium. Worth every cent.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80&fit=crop&crop=face',
  },
];

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'fill-cyan text-cyan' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsCarousel() {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef(null);

  const { data: dbReviews = [] } = useQuery({
    queryKey: ['reviews-home'],
    queryFn: () => base44.entities.Review.filter({ is_approved: true }, '-created_date', 10),
  });

  const reviews = dbReviews.length >= 3 ? dbReviews : FALLBACK_REVIEWS;
  const total = reviews.length;

  const go = (idx, dir) => {
    setDirection(dir);
    setCurrent(idx);
    resetTimer();
  };

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + total) % total);
  }, [total]);

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  const variants = {
    enter: dir => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: dir => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const review = reviews[current];
  const label = lang === 'de' ? 'Kundenbewertungen' : 'Customer Reviews';
  const heading = lang === 'de' ? 'Was unsere Kunden sagen' : 'What Our Customers Say';

  return (
    <section className="bg-dark-deep py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] uppercase text-cyan mb-3">{label}</p>
          <h2 className="font-heading text-4xl md:text-5xl text-white font-light">{heading}</h2>
        </div>

        {/* Card */}
        <div className="relative min-h-[260px] flex items-center justify-center">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              key={review.id || current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="w-full"
            >
              <div className="bg-dark/60 border border-white/10 p-8 md:p-12 text-center mx-auto max-w-2xl">
                {/* Avatar */}
                <div className="flex justify-center mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyan/40">
                    {review.photo ? (
                      <img src={review.photo} alt={review.author_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-dark flex items-center justify-center text-cyan font-heading text-xl">
                        {review.author_name?.[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex justify-center mb-4">
                  <StarRow rating={review.rating} />
                </div>

                {/* Quote */}
                <Quote className="w-5 h-5 text-cyan/30 mx-auto mb-3" />
                <p className="text-white/80 text-sm md:text-base leading-relaxed font-light italic mb-5">
                  "{review.comment}"
                </p>

                {/* Author */}
                <p className="text-xs tracking-[0.25em] uppercase text-cyan">{review.author_name}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 mt-8">
          <button
            onClick={() => { prev(); resetTimer(); }}
            className="w-9 h-9 border border-white/20 hover:border-cyan hover:text-cyan text-white/40 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > current ? 1 : -1)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-6 h-1.5 bg-cyan' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => { next(); resetTimer(); }}
            className="w-9 h-9 border border-white/20 hover:border-cyan hover:text-cyan text-white/40 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}