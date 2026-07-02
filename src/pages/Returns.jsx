import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, RotateCcw, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const copy = {
  en: {
    eyebrow: 'Returns Policy',
    title: 'Easy\nReturns.',
    intro: 'Not the right fit? No worries. You have 14 days from delivery to return unworn items for a full refund.',
    stepsHeading: 'How it works',
    steps: [
      { icon: Mail, title: 'Contact us', desc: 'Email returns@tillicollapse.com with your order number within 14 days of delivery.' },
      { icon: Package, title: 'Pack your item', desc: 'Place items in original condition (unworn, unwashed, tags attached) in secure packaging.' },
      { icon: RotateCcw, title: 'Ship it back', desc: 'Send the parcel to the return address we provide. We recommend tracked shipping.' },
      { icon: CheckCircle2, title: 'Get refunded', desc: 'Once received and inspected, we refund to your original payment method within 5 to 10 business days.' },
    ],
    conditionsHeading: 'Return conditions',
    conditionsGood: [
      'Items returned within 14 days of delivery',
      'Unworn, unwashed and in original condition',
      'Original tags and packaging attached',
      'Proof of purchase (order number or receipt)',
    ],
    conditionsBadHeading: 'We cannot accept',
    conditionsBad: [
      'Worn, washed, or damaged items',
      'Items without original tags',
      'Underwear and boxers (hygiene reasons)',
      'Sale items marked as final sale',
    ],
    costsHeading: 'Return shipping costs',
    costs: 'Return shipping is paid by the customer, except when the item is faulty or we shipped the wrong product. In those cases we cover the full return cost.',
    refundHeading: 'Refund timing',
    refund: 'Once your return is received and inspected, we will notify you by email. Refunds are processed to the original payment method within 5 to 10 business days. Depending on your bank, it may take a few additional days to appear on your statement.',
    exchangesHeading: 'Exchanges',
    exchanges: 'We do not offer direct exchanges. To change size or color, return the original item for a refund and place a new order.',
    withdrawalHeading: 'Your right of withdrawal',
    withdrawal: 'As a consumer in the EU, you have a statutory right of withdrawal within 14 days without giving any reason. For full legal details, please see our',
    withdrawalLink: 'Right of Withdrawal',
    ctaHeading: 'Need help?',
    ctaText: 'Our team responds within 24 hours on business days.',
    ctaButton: 'Contact Support',
  },
  de: {
    eyebrow: 'Rückgabe-Richtlinie',
    title: 'Einfache\nRückgabe.',
    intro: 'Passt nicht? Kein Problem. Du hast 14 Tage nach Erhalt Zeit, ungetragene Ware zurückzuschicken und dein Geld zurückzubekommen.',
    stepsHeading: 'So funktioniert es',
    steps: [
      { icon: Mail, title: 'Kontakt aufnehmen', desc: 'Schreibe innerhalb von 14 Tagen an returns@tillicollapse.com mit deiner Bestellnummer.' },
      { icon: Package, title: 'Ware verpacken', desc: 'Lege die Artikel im Originalzustand (ungetragen, ungewaschen, Etiketten dran) sicher verpackt in ein Paket.' },
      { icon: RotateCcw, title: 'Zurückschicken', desc: 'Sende das Paket an die Rücksendeadresse, die wir dir mitteilen. Versicherter Versand empfohlen.' },
      { icon: CheckCircle2, title: 'Rückerstattung', desc: 'Nach Erhalt und Prüfung erstatten wir dir den Betrag innerhalb von 5 bis 10 Werktagen auf dein Zahlungsmittel.' },
    ],
    conditionsHeading: 'Rückgabebedingungen',
    conditionsGood: [
      'Rückgabe innerhalb von 14 Tagen nach Erhalt',
      'Ungetragen, ungewaschen, im Originalzustand',
      'Original-Etiketten und -Verpackung vorhanden',
      'Kaufnachweis (Bestellnummer oder Beleg)',
    ],
    conditionsBadHeading: 'Wir akzeptieren nicht',
    conditionsBad: [
      'Getragene, gewaschene oder beschädigte Artikel',
      'Artikel ohne Original-Etiketten',
      'Unterwäsche und Boxer (aus Hygienegründen)',
      'Als Endverkauf markierte Sale-Artikel',
    ],
    costsHeading: 'Kosten der Rücksendung',
    costs: 'Die Rücksendekosten trägt der Kunde, außer bei fehlerhafter oder falsch gelieferter Ware. In diesen Fällen übernehmen wir die vollen Rücksendekosten.',
    refundHeading: 'Erstattungsdauer',
    refund: 'Sobald deine Rücksendung eingegangen und geprüft wurde, informieren wir dich per E-Mail. Die Rückerstattung erfolgt innerhalb von 5 bis 10 Werktagen auf das ursprüngliche Zahlungsmittel. Je nach Bank kann es einige Tage länger dauern, bis der Betrag sichtbar ist.',
    exchangesHeading: 'Umtausch',
    exchanges: 'Wir bieten keinen direkten Umtausch an. Für Größen- oder Farbwechsel schicke den Artikel zur Erstattung zurück und bestelle neu.',
    withdrawalHeading: 'Dein Widerrufsrecht',
    withdrawal: 'Als Verbraucher in der EU hast du ein gesetzliches Widerrufsrecht von 14 Tagen ohne Angabe von Gründen. Alle rechtlichen Details findest du in unserer',
    withdrawalLink: 'Widerrufsbelehrung',
    ctaHeading: 'Brauchst du Hilfe?',
    ctaText: 'Unser Team antwortet an Werktagen innerhalb von 24 Stunden.',
    ctaButton: 'Support kontaktieren',
  },
};

export default function Returns() {
  const { lang } = useLanguage();
  const c = copy[lang] || copy.en;

  return (
    <div>
      {/* Hero */}
      <section className="grain-overlay bg-dark-deep text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">{c.eyebrow}</p>
            </div>
            <h1 className="font-display uppercase leading-[0.85] text-6xl md:text-8xl lg:text-9xl whitespace-pre-line">
              {c.title}
            </h1>
            <p className="mt-8 max-w-2xl text-base md:text-lg text-white/60 leading-relaxed">
              {c.intro}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-14 md:py-24 space-y-20 md:space-y-28">

        {/* Steps */}
        <section>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-8">{c.stepsHeading}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {c.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-5"
                >
                  <div className="shrink-0">
                    <div className="w-11 h-11 border border-dark flex items-center justify-center">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <p className="font-display text-xs tracking-[0.3em] text-gray-text mt-2 text-center">0{i + 1}</p>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-heading text-xl mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-text leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Conditions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pt-8 border-t border-border">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-6">{c.conditionsHeading}</p>
            <ul className="space-y-3">
              {c.conditionsGood.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-cyan-dark" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-6">{c.conditionsBadHeading}</p>
            <ul className="space-y-3">
              {c.conditionsBad.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-gray-text">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Text sections */}
        <section className="space-y-12 pt-8 border-t border-border">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-4">{c.costsHeading}</p>
            <p className="text-sm md:text-base leading-relaxed max-w-3xl">{c.costs}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-4">{c.refundHeading}</p>
            <p className="text-sm md:text-base leading-relaxed max-w-3xl">{c.refund}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-4">{c.exchangesHeading}</p>
            <p className="text-sm md:text-base leading-relaxed max-w-3xl">{c.exchanges}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-4">{c.withdrawalHeading}</p>
            <p className="text-sm md:text-base leading-relaxed max-w-3xl">
              {c.withdrawal}{' '}
              <Link to="/widerruf" className="underline underline-offset-4 hover:text-cyan-dark transition-colors">
                {c.withdrawalLink}
              </Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="grain-overlay bg-dark-deep text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-cyan mb-2">{c.ctaHeading}</p>
            <p className="font-heading text-2xl md:text-3xl">{c.ctaText}</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 bg-cyan text-dark-deep px-8 py-4 text-xs tracking-[0.25em] uppercase hover:bg-cyan-dark transition-colors self-start md:self-auto"
          >
            {c.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}