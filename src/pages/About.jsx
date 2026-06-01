import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export default function About() {
  const { t, lang } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="bg-dark-deep py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] uppercase text-cyan mb-4">{t('about.story')}</p>
            <h1 className="font-heading text-5xl md:text-7xl text-white font-light">TIC ORIGINALS</h1>
            <div className="w-12 h-px bg-cyan mx-auto mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-8">Manifesto</p>
          <blockquote className="font-heading text-3xl md:text-4xl font-light leading-relaxed italic text-dark mb-12">
            "Cause sometimes you just feel tired. Feel weak, and when you feel weak. You feel like you wanna just give up. But you gotta search within you. Try to find that inner strength and just pull that shit out of you. And get that motivation to not give up. And not be a quitter. No matter how bad you wanna just fall flat on your face and COLLAPSE."
          </blockquote>
        </motion.div>
      </section>

      {/* Story */}
      <section className="bg-muted py-24">
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl mb-6">
              {lang === 'de' ? 'Till I Collapse (TIC) Biografie' : 'Till I Collapse (TIC) Biography'}
            </h2>
            <div className="space-y-6 text-gray-text leading-relaxed">
              <p>
                {lang === 'de'
                  ? 'Till I Collapse (TIC) steht für mehr als nur Kleidung. Es ist eine Haltung. Geboren aus dem Gedanken, niemals aufzugeben, verkörpert TIC den unaufhaltsamen Drang, weiterzumachen, egal wie schwer der Weg ist.'
                  : 'Till I Collapse (TIC) stands for more than just clothing. It\'s an attitude. Born from the idea of never giving up, TIC embodies the unstoppable drive to keep going, no matter how hard the road.'}
              </p>
              <p>
                {lang === 'de'
                  ? 'Wir designen hochwertige Streetwear für Menschen, die ihren eigenen Weg gehen. Jedes Piece ist darauf ausgelegt, Stil, Qualität und Attitude zu vereinen. Minimalistisch im Look, aber maximal in der Aussage.'
                  : 'We design premium streetwear for people who walk their own path. Every piece is built to unite style, quality and attitude. Minimalist in look, but maximum in message.'}
              </p>
              <p>
                {lang === 'de'
                  ? 'Entstanden in Deutschland, gedacht für die ganze Welt. TIC ist mehr als eine Brand. Es ist ein globales Projekt, das Menschen verbindet, die dieselbe Mentalität teilen.'
                  : 'Born in Germany, made for the whole world. TIC is more than a brand. It\'s a global project that connects people who share the same mentality.'}
              </p>
              <p className="font-heading italic text-dark text-xl">
                {lang === 'de'
                  ? '1 World. Eine Vision, die keine Grenzen kennt.'
                  : '1 World. A vision that knows no borders.'}
              </p>
              <p>
                {lang === 'de'
                  ? 'Till I Collapse richtet sich an alle, die mehr wollen. Mehr als Durchschnitt. Mehr als Trends. Mehr als Stillstand.'
                  : 'Till I Collapse is for everyone who wants more. More than average. More than trends. More than standstill.'}
              </p>
              <p className="font-heading text-dark text-2xl tracking-wide">
                {lang === 'de'
                  ? 'No limits. No excuses. Till I Collapse.'
                  : 'No limits. No excuses. Till I Collapse.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          {[
            { title: lang === 'de' ? 'Qualität' : 'Quality', desc: lang === 'de' ? 'Premium-Materialien, die bestehen bleiben' : 'Premium materials built to last' },
            { title: lang === 'de' ? 'Stärke' : 'Strength', desc: lang === 'de' ? 'Jedes Stück erzählt eine Geschichte der Ausdauer' : 'Every piece tells a story of endurance' },
            { title: lang === 'de' ? 'Stil' : 'Style', desc: lang === 'de' ? 'Minimalistisches Design, maximale Wirkung' : 'Minimalist design, maximum impact' },
          ].map((val, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <h3 className="font-heading text-2xl mb-3">{val.title}</h3>
              <p className="text-sm text-gray-text">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}