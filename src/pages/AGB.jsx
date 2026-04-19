import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AGB() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl md:text-5xl font-light mb-12">
        {de ? 'Allgemeine Geschäftsbedingungen' : 'Terms & Conditions'}
      </h1>
      <div className="prose prose-sm max-w-none space-y-8 text-gray-text leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '1. Geltungsbereich' : '1. Scope'}</h2>
          <p>{de ? 'Diese AGB gelten für alle Bestellungen über unseren Online-Shop von TIC ORIGINALS, An der Oberen Au 4, 85072 Eichstätt.' : 'These terms apply to all orders through our online shop by TIC ORIGINALS, An der Oberen Au 4, 85072 Eichstätt.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '2. Vertragsschluss' : '2. Contract Conclusion'}</h2>
          <p>{de ? 'Die Darstellung der Produkte stellt kein rechtlich bindendes Angebot dar. Durch Klicken auf „Bestellung aufgeben" geben Sie eine verbindliche Bestellung ab.' : 'The display of products does not constitute a legally binding offer. By clicking "Place Order" you submit a binding order.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '3. Preise und Versand' : '3. Prices and Shipping'}</h2>
          <p>{de ? 'Alle Preise sind Endpreise inkl. 19% MwSt. Versandkosten: €4,95 (Standard), kostenlos ab €80. Lieferzeit: 2-5 Werktage innerhalb Deutschlands.' : 'All prices are final prices incl. 19% VAT. Shipping: €4.95 (standard), free above €80. Delivery time: 2-5 business days within Germany.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '4. Zahlung' : '4. Payment'}</h2>
          <p>{de ? 'Wir akzeptieren Kreditkarte (Visa, Mastercard, AMEX) über Stripe und PayPal.' : 'We accept credit card (Visa, Mastercard, AMEX) via Stripe and PayPal.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '5. Widerrufsrecht' : '5. Right of Withdrawal'}</h2>
          <p>{de ? 'Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Waren in Besitz genommen haben.' : 'You have the right to withdraw from this contract within 14 days without giving any reason. The withdrawal period is 14 days from the day on which you or a third party named by you took possession of the goods.'}</p>
          <p>{de ? 'Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung informieren: company@ticoriginals.com' : 'To exercise your right of withdrawal, you must inform us by means of a clear declaration: company@ticoriginals.com'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '6. Rückgabe und Erstattung' : '6. Returns and Refunds'}</h2>
          <p>{de ? 'Die Kosten der Rücksendung trägt der Käufer. Die Erstattung erfolgt innerhalb von 14 Tagen nach Erhalt der Rücksendung über die ursprüngliche Zahlungsmethode.' : 'The buyer bears the cost of return shipping. Refunds will be processed within 14 days of receiving the return via the original payment method.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '7. Gewährleistung' : '7. Warranty'}</h2>
          <p>{de ? 'Es gelten die gesetzlichen Gewährleistungsrechte.' : 'Statutory warranty rights apply.'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{de ? '8. Anwendbares Recht' : '8. Applicable Law'}</h2>
          <p>{de ? 'Es gilt deutsches Recht. Gerichtsstand ist Eichstätt.' : 'German law applies. Place of jurisdiction is Eichstätt.'}</p>
        </section>
      </div>
    </div>
  );
}