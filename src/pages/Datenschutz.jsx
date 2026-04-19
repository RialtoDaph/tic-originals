import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Datenschutz() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl md:text-5xl font-light mb-12">
        {de ? 'Datenschutzerklärung' : 'Privacy Policy'}
      </h1>
      <div className="prose prose-sm max-w-none space-y-8 text-gray-text leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '1. Datenschutz auf einen Blick' : '1. Privacy at a Glance'}</h2>
          <p>{de ? 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.' : 'The following notes provide a simple overview of what happens to your personal data when you visit this website.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '2. Verantwortliche Stelle' : '2. Responsible Party'}</h2>
          <p>TIC ORIGINALS<br />An der Oberen Au 4<br />85072 Eichstätt<br />E-Mail: company@ticoriginals.com</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '3. Datenerfassung' : '3. Data Collection'}</h2>
          <p>{de ? 'Wir erheben personenbezogene Daten, wenn Sie eine Bestellung aufgeben (Name, Adresse, E-Mail, Telefon), unseren Newsletter abonnieren (E-Mail), oder uns kontaktieren.' : 'We collect personal data when you place an order (name, address, email, phone), subscribe to our newsletter (email), or contact us.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '4. Cookies' : '4. Cookies'}</h2>
          <p>{de ? 'Unsere Website verwendet essenzielle Cookies für die Funktionalität und optionale analytische Cookies (nur mit Ihrer Zustimmung).' : 'Our website uses essential cookies for functionality and optional analytics cookies (only with your consent).'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '5. Ihre Rechte (DSGVO)' : '5. Your Rights (GDPR)'}</h2>
          <p>{de ? 'Sie haben das Recht auf: Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch. Kontaktieren Sie uns: company@ticoriginals.com' : 'You have the right to: access, rectification, erasure, restriction of processing, data portability, objection. Contact us: company@ticoriginals.com'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '6. Zahlungsabwicklung' : '6. Payment Processing'}</h2>
          <p>{de ? 'Zahlungen werden über Stripe und PayPal abgewickelt. Ihre Zahlungsdaten werden direkt von diesen Anbietern verarbeitet und nicht auf unseren Servern gespeichert.' : 'Payments are processed via Stripe and PayPal. Your payment data is processed directly by these providers and not stored on our servers.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '7. Speicherdauer' : '7. Storage Duration'}</h2>
          <p>{de ? 'Bestelldaten werden für 10 Jahre gespeichert (gesetzliche Aufbewahrungspflicht). Newsletter-Daten werden bis zum Widerruf gespeichert.' : 'Order data is stored for 10 years (legal retention obligation). Newsletter data is stored until revocation.'}</p>
        </section>
      </div>
    </div>
  );
}