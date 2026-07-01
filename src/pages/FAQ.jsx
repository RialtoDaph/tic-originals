import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqData = {
  en: [
    { q: 'How long does shipping take?', a: 'Standard shipping within Germany takes 2-5 business days. We ship via DHL and Hermes.' },
    { q: 'How much is shipping?', a: 'Standard shipping costs €4.95. Orders over €80 qualify for free shipping.' },
    { q: 'Can I return my order?', a: 'Yes, you have 14 days to return your order (Widerrufsrecht). Contact us at company@ticoriginals.com to initiate a return.' },
    { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, and AMEX via Stripe, as well as PayPal.' },
    { q: 'Do you ship outside of Germany?', a: 'Currently, we only ship within Germany. International shipping is coming soon.' },
    { q: 'How can I track my order?', a: 'After your order ships, you will receive a tracking number via email. You can also track your order on our website.' },
    { q: 'What sizes do you offer?', a: 'Our Slim Tee comes in XS, S, M, and L. Our SMDB Boxers come in S, M, and L.' },
    { q: 'Are prices inclusive of VAT?', a: 'Yes, all prices include 19% German VAT (MwSt.).' },
  ],
  de: [
    { q: 'Wie lange dauert der Versand?', a: 'Der Standardversand innerhalb Deutschlands dauert 2-5 Werktage. Wir versenden über DHL und Hermes.' },
    { q: 'Was kostet der Versand?', a: 'Der Standardversand kostet €4,95. Ab €80 Bestellwert ist der Versand kostenlos.' },
    { q: 'Kann ich meine Bestellung zurückgeben?', a: 'Ja, Sie haben ein 14-tägiges Widerrufsrecht. Kontaktieren Sie uns unter company@ticoriginals.com für eine Rücksendung.' },
    { q: 'Welche Zahlungsmethoden akzeptieren Sie?', a: 'Wir akzeptieren Visa, Mastercard und AMEX über Stripe sowie PayPal.' },
    { q: 'Liefern Sie auch außerhalb Deutschlands?', a: 'Derzeit liefern wir nur innerhalb Deutschlands. Internationaler Versand kommt bald.' },
    { q: 'Wie kann ich meine Bestellung verfolgen?', a: 'Nach dem Versand erhalten Sie eine Sendungsnummer per E-Mail. Sie können Ihre Bestellung auch auf unserer Website verfolgen.' },
    { q: 'Welche Größen bieten Sie an?', a: 'Unser Slim Tee ist in XS, S, M und L erhältlich. Unsere SMDB Boxers in S, M und L.' },
    { q: 'Sind die Preise inklusive Mehrwertsteuer?', a: 'Ja, alle Preise verstehen sich inklusive 19% MwSt.' },
  ]
};

export default function FAQ() {
  const { lang } = useLanguage();
  const items = faqData[lang] || faqData.en;
  const [open, setOpen] = useState(null);

  return (
    <div>
      {/* Hero */}
      <section className="grain-overlay bg-dark-deep text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">04 / Help Desk</p>
            </div>
            <h1 className="font-display uppercase leading-[0.85] text-[20vw] md:text-[14vw] lg:text-[180px]">
              F.A.<span className="text-cyan">Q.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm md:text-base text-white/60">
              {lang === 'de'
                ? 'Antworten auf die häufigsten Fragen. Nicht dabei? Schreib uns.'
                : 'Answers to what everyone asks. Not here? Ask us.'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 md:py-20">
        <div className="border-t border-dark">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-border">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-6 md:py-7 text-left group"
                >
                  <div className="flex items-start gap-4 md:gap-6 flex-1 min-w-0">
                    <span className="font-display text-xl md:text-2xl text-cyan shrink-0 leading-none pt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-lg md:text-2xl uppercase leading-tight group-hover:text-cyan transition-colors">
                      {item.q}
                    </span>
                  </div>
                  <div className={`w-10 h-10 border border-border flex items-center justify-center shrink-0 transition-all ${isOpen ? 'bg-dark-deep text-white border-dark-deep' : ''}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 md:pb-8 md:pl-14 text-sm md:text-base text-gray-text leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-14 md:mt-20 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-3">{lang === 'de' ? 'Noch Fragen?' : 'Still curious?'}</p>
          <h3 className="font-display text-3xl md:text-4xl uppercase mb-6">
            {lang === 'de' ? 'Schreib uns.' : 'Reach out.'}
          </h3>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-dark-deep text-white px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-cyan hover:text-dark-deep transition-colors"
          >
            {lang === 'de' ? 'Kontakt' : 'Contact'}
          </a>
        </div>
      </div>
    </div>
  );
}