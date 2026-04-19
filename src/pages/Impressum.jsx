import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Impressum() {
  const { lang } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl md:text-5xl font-light mb-12">Impressum</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-gray-text leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{lang === 'de' ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}</h2>
          <p>TIC ORIGINALS</p>
          <p>An der Oberen Au 4<br />85072 Eichstätt<br />{lang === 'de' ? 'Deutschland' : 'Germany'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{lang === 'de' ? 'Kontakt' : 'Contact'}</h2>
          <p>E-Mail: company@ticoriginals.com<br />{lang === 'de' ? 'Telefon' : 'Phone'}: +49 152 06234894</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{lang === 'de' ? 'Umsatzsteuer-ID' : 'VAT ID'}</h2>
          <p>{lang === 'de' ? 'Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: [In Bearbeitung]' : 'VAT identification number according to § 27 a of the German VAT Act: [Pending]'}</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{lang === 'de' ? 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV' : 'Responsible for content according to § 55 Abs. 2 RStV'}</h2>
          <p>TIC ORIGINALS<br />An der Oberen Au 4<br />85072 Eichstätt</p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-dark mb-2">{lang === 'de' ? 'Streitschlichtung' : 'Dispute Resolution'}</h2>
          <p>{lang === 'de'
            ? 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
            : 'The European Commission provides a platform for online dispute resolution (OS): https://ec.europa.eu/consumers/odr/. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.'}
          </p>
        </section>
      </div>
    </div>
  );
}