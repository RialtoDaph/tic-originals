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
            "Cause sometimes you just feel tired... But you gotta search within you, try to find that inner strength and just pull that shit out of you. And get that motivation to not give up."
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
              {lang === 'de' ? 'Die Geschichte' : 'The Story'}
            </h2>
            <div className="space-y-6 text-gray-text leading-relaxed">
              <p>
                {lang === 'de'
                  ? 'TIC ORIGINALS — Till I Collapse — wurde mit einer einfachen, aber kraftvollen Idee geboren: Kleidung zu schaffen, die den unerschütterlichen Geist in jedem von uns verkörpert. Von Eichstätt, Deutschland aus, gestalten wir Premium-Streetwear, die die Grenze zwischen Luxus und Straßenkultur verwischt.'
                  : 'TIC ORIGINALS — Till I Collapse — was born from a simple yet powerful idea: to create clothing that embodies the unyielding spirit in all of us. From Eichstätt, Germany, we craft premium streetwear that blurs the line between luxury and street culture.'}
              </p>
              <p>
                {lang === 'de'
                  ? 'Jedes Stück ist eine Erinnerung daran, dass Stärke nicht nur in den Muskeln liegt, sondern im Willen, nicht aufzugeben. Wir glauben, dass wahre Stärke von innen kommt — und unsere Kleidung ist ein Symbol dieser inneren Kraft.'
                  : 'Each piece is a reminder that strength isn\'t just in muscle — it\'s in the will to never give up. We believe true strength comes from within, and our clothing is a symbol of that inner power.'}
              </p>
              <p>
                {lang === 'de'
                  ? 'Mit erstklassigen Materialien und minimalistischem Design schaffen wir zeitlose Stücke, die so widerstandsfähig sind wie der Geist, den sie repräsentieren.'
                  : 'With premium materials and minimalist design, we create timeless pieces that are as resilient as the spirit they represent.'}
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