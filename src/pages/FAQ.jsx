import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-3">TIC ORIGINALS</p>
        <h1 className="font-heading text-5xl font-light">FAQ</h1>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border px-6">
            <AccordionTrigger className="text-sm text-left hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-text leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}