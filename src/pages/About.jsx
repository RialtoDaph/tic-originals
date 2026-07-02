import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Zap, Sparkles } from 'lucide-react';
import Marquee from '@/components/common/Marquee';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

export default function About() {
  const { t, lang } = useLanguage();

  const values = [
    { icon: Award, num: '01', title: lang === 'de' ? 'Qualität' : 'Quality', desc: lang === 'de' ? 'Premium-Materialien, die bestehen bleiben' : 'Premium materials built to last' },
    { icon: Zap, num: '02', title: lang === 'de' ? 'Stärke' : 'Strength', desc: lang === 'de' ? 'Jedes Stück erzählt eine Geschichte der Ausdauer' : 'Every piece tells a story of endurance' },
    { icon: Sparkles, num: '03', title: lang === 'de' ? 'Stil' : 'Style', desc: lang === 'de' ? 'Minimalistisches Design, maximale Wirkung' : 'Minimalist design, maximum impact' },
  ];

  return (
    <div className="bg-white">
      {/* HERO: bold display headline + grain */}
      <section className="grain-overlay bg-dark-deep text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-32 md:pb-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">{t('about.story')}</p>
            </div>
            <h1 className="font-display leading-[0.85] text-white uppercase text-[18vw] md:text-[14vw] lg:text-[220px]">
              TILL I<br />
              <span className="text-outline text-white">COLLAPSE</span>
            </h1>
            <div className="mt-6 md:mt-10 flex flex-wrap items-end justify-between gap-4">
              <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/60 max-w-md">
                {lang === 'de' ? 'Streetwear für jene, die niemals aufgeben.' : 'Streetwear for those who never give up.'}
              </p>
              <p className="font-display text-2xl md:text-5xl text-cyan tracking-wider">EST. 2026</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-cyan text-dark-deep py-4 border-y-2 border-dark-deep">
        <Marquee items={['TILL I COLLAPSE', 'NO LIMITS', '1 WORLD', 'BORN IN GERMANY', 'EST. 2026']} />
      </div>

      {/* MANIFESTO: asymmetric split */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-32">
        <div className="grid grid-cols-12 gap-4 md:gap-10">
          <motion.div {...fadeUp} className="col-span-12 md:col-span-3">
            <p className="font-display text-[80px] md:text-[180px] leading-[0.8] text-cyan/80">01</p>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mt-1 md:mt-2">Manifesto</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.15 }} className="col-span-12 md:col-span-9 md:pt-10">
            <blockquote className="font-heading text-lg sm:text-xl md:text-3xl lg:text-4xl font-light leading-[1.5] italic text-dark space-y-4">
              <p>"Cause sometimes you just feel tired. Feel weak, and when you feel weak, you feel like you wanna just give up.</p>
              <p>But you gotta search within you. Try to find that inner strength and just pull that shit out of you.</p>
              <p>And get that motivation to not give up. And not be a quitter. No matter how bad you wanna just fall flat on your face and COLLAPSE."</p>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* STORY: black block */}
      <section className="grain-overlay bg-dark-deep text-white py-16 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 font-display text-[300px] md:text-[500px] leading-none text-white/[0.04] select-none pointer-events-none">TIC</div>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-12 gap-4 md:gap-10">
            <motion.div {...fadeUp} className="col-span-12 md:col-span-3">
              <p className="font-display text-[80px] md:text-[180px] leading-[0.8] text-cyan/80">02</p>
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan mt-1 md:mt-2">
                {lang === 'de' ? 'Biografie' : 'Biography'}
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.15 }} className="col-span-12 md:col-span-9 space-y-5 md:space-y-6 text-white/80 leading-relaxed md:pt-10">
              <h2 className="font-display text-3xl sm:text-4xl md:text-6xl text-white uppercase leading-[0.9] mb-5 md:mb-8">
                {lang === 'de' ? 'Mehr als Kleidung.' : 'More than clothing.'}<br />
                <span className="text-cyan">{lang === 'de' ? 'Eine Haltung.' : 'An attitude.'}</span>
              </h2>
              <p className="text-base md:text-lg max-w-2xl">
                {lang === 'de'
                  ? 'Till I Collapse (TIC) steht für mehr als nur Kleidung. Geboren aus dem Gedanken, niemals aufzugeben, verkörpert TIC den unaufhaltsamen Drang, weiterzumachen, egal wie schwer der Weg ist.'
                  : 'Till I Collapse (TIC) stands for more than just clothing. Born from the idea of never giving up, TIC embodies the unstoppable drive to keep going, no matter how hard the road.'}
              </p>
              <p className="text-base md:text-lg max-w-2xl">
                {lang === 'de'
                  ? 'Wir designen hochwertige Streetwear für Menschen, die ihren eigenen Weg gehen. Jedes Piece ist darauf ausgelegt, Stil, Qualität und Attitude zu vereinen. Minimalistisch im Look, aber maximal in der Aussage.'
                  : 'We design premium streetwear for people who walk their own path. Every piece is built to unite style, quality and attitude. Minimalist in look, but maximum in message.'}
              </p>
              <p className="text-base md:text-lg max-w-2xl">
                {lang === 'de'
                  ? 'Entstanden in Deutschland, gedacht für die ganze Welt. TIC ist mehr als eine Brand. Es ist ein globales Projekt, das Menschen verbindet, die dieselbe Mentalität teilen.'
                  : 'Born in Germany, made for the whole world. TIC is more than a brand. It\'s a global project that connects people who share the same mentality.'}
              </p>
              <div className="pt-5 md:pt-6 border-t border-white/10 mt-6 md:mt-10">
                <p className="font-display text-2xl sm:text-3xl md:text-5xl text-cyan uppercase tracking-wide">
                  {lang === 'de' ? '1 World. Eine Vision.' : '1 World. One Vision.'}
                </p>
                <p className="font-display text-xl sm:text-2xl md:text-4xl text-white/50 uppercase tracking-wide mt-1 md:mt-2">
                  {lang === 'de' ? 'Ohne Grenzen.' : 'No borders.'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES: bento asymmetric */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-32">
        <div className="grid grid-cols-12 gap-4 md:gap-10 mb-10 md:mb-16">
          <motion.div {...fadeUp} className="col-span-12 md:col-span-3">
            <p className="font-display text-[80px] md:text-[180px] leading-[0.8] text-cyan/80">03</p>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mt-1 md:mt-2">Values</p>
          </motion.div>
          <motion.h2 {...fadeUp} transition={{ duration: 0.8, delay: 0.15 }} className="col-span-12 md:col-span-9 font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl uppercase leading-[0.9] text-dark-deep md:pt-10">
            {lang === 'de' ? 'Woran wir glauben.' : 'What we stand for.'}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {values.map((val, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.8, delay: i * 0.12 }}
              className="bg-white p-8 md:p-12 group hover:bg-dark-deep hover:text-white transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-6 md:mb-8">
                <val.icon className="w-6 h-6 text-cyan" strokeWidth={1.5} />
                <span className="font-display text-3xl md:text-4xl text-gray-text/40 group-hover:text-white/30 transition-colors">{val.num}</span>
              </div>
              <h3 className="font-display text-2xl md:text-4xl uppercase mb-3 md:mb-4 tracking-wide">{val.title}</h3>
              <p className="text-sm text-gray-text group-hover:text-white/70 transition-colors leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA: full-bleed high contrast */}
      <section className="grain-overlay bg-cyan py-16 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative">
          <motion.div {...fadeUp}>
            <p className="text-[10px] tracking-[0.4em] uppercase text-dark-deep/70 mb-4 md:mb-6">
              {lang === 'de' ? 'Bereit für die Bewegung?' : 'Ready for the movement?'}
            </p>
            <h2 className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] text-dark-deep mb-8 md:mb-10">
              NO LIMITS.<br />NO EXCUSES.
            </h2>
            <Link to="/products" className="inline-flex items-center gap-3 bg-dark-deep text-white px-8 md:px-10 py-4 md:py-5 text-[10px] md:text-xs tracking-[0.25em] uppercase hover:gap-5 transition-all">
              {lang === 'de' ? 'Kollektion entdecken' : 'Shop the Collection'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}