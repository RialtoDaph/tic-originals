import React, { useState, useRef } from 'react';
import { getLegalPage } from '@/functions/getLegalPage';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function LegalPageTemplate({ slug }) {
  const { lang } = useLanguage();
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const sectionRefs = useRef({});

  // Fetch ONLY this page by slug
  const { data: page, isLoading: loading } = useQuery({
    queryKey: ['legal-page', slug],
    queryFn: async () => {
      const res = await getLegalPage({ slug });
      return res.data.page || null;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const title = page ? (lang === 'de' ? page.title_de : (page.title_en || page.title_de)) : '';
  const subtitle = page ? (lang === 'de' ? page.subtitle_de : (page.subtitle_en || page.subtitle_de)) : '';
  // Prefer requested lang, fallback to the other lang if empty
  const rawContent = page
    ? (lang === 'de'
        ? (page.content_de || page.content_en)
        : (page.content_en || page.content_de))
    : null;

  let sections = [];
  if (rawContent) {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) sections = parsed;
    } catch (e) {
      console.error(`[LegalPage] parse error slug=${slug}`, e);
    }
  }

  const scrollTo = (id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(title || slug, margin, y);
    y += 8;

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text(subtitle, margin, y);
      y += 6;
    }

    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 10;

    // Sections
    sections.forEach((sec) => {
      if (y > pageHeight - 30) { doc.addPage(); y = margin; }

      if (sec.heading) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const headingLines = doc.splitTextToSize(sec.heading, maxWidth);
        doc.text(headingLines, margin, y);
        y += headingLines.length * 5 + 2;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const bodyLines = doc.splitTextToSize(sec.body || '', maxWidth);
      bodyLines.forEach((line) => {
        if (y > pageHeight - 20) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 5;
      });
      y += 6;
    });

    // Footer
    if (page?.last_updated) {
      if (y > pageHeight - 20) { doc.addPage(); y = margin; }
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `${lang === 'de' ? 'Zuletzt aktualisiert:' : 'Last updated:'} ${page.last_updated}`,
        margin,
        y + 4
      );
    }

    doc.save(`TIC-ORIGINALS-${slug}-${lang}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-sm tracking-widest text-gray-text">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-dark-deep text-white px-6 pt-12 pb-10">
        <div className="max-w-[760px] mx-auto">
          <div className="flex justify-between items-start gap-6">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.22em] uppercase text-cyan mb-3 font-body">
                TIC ORIGINALS
              </p>
              <h1 className="font-heading font-light leading-tight text-[clamp(28px,5vw,48px)] m-0">
                {title || (lang === 'de' ? 'Rechtliches' : 'Legal')}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-text mt-3 font-body">{subtitle}</p>
              )}
            </div>
            {/* Download PDF */}
            {sections.length > 0 && (
              <button
                onClick={downloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-body text-gray-text hover:text-cyan transition-colors shrink-0 mt-1"
                title="Download PDF"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Nav */}
      {sections.length > 0 && (
        <div className="bg-dark-deep border-t border-dark-light">
          <div className="max-w-[760px] mx-auto px-6 overflow-x-auto">
            <div className="flex gap-0">
              {sections.map((sec, i) => (
                <button
                  key={sec.id || i}
                  onClick={() => scrollTo(sec.id || `section-${i}`)}
                  className="px-4 py-3 text-[11px] tracking-[0.12em] uppercase text-gray-text hover:text-cyan transition-colors font-body whitespace-nowrap"
                >
                  {sec.id || `§${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-[760px] mx-auto px-6 py-12 pb-20">
        {sections.length === 0 && (
          <p className="text-sm text-gray-text font-body">
            {lang === 'de' ? 'Inhalt wird geladen…' : 'Content coming soon…'}
          </p>
        )}

        {sections.map((sec, i) => {
          const sectionId = sec.id || `section-${i}`;
          const isNote = !!sec.note;

          return (
            <div
              key={sectionId}
              ref={el => sectionRefs.current[sectionId] = el}
              className={`${i > 0 ? 'mt-10 pt-10 border-t border-border' : ''} ${
                isNote ? 'bg-cyan/10 border border-cyan/30 p-6 rounded-sm' : ''
              }`}
            >
              {sec.heading && (
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-text font-body font-medium mb-3.5">
                  {sec.heading}
                </p>
              )}
              <div
                className={`font-heading text-[15px] leading-[1.85] text-dark whitespace-pre-line ${
                  isNote ? 'italic' : ''
                }`}
              >
                {sec.body}
              </div>

              {/* Withdrawal Form Toggle */}
              {sec.hasForm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowWithdrawalForm(v => !v)}
                    className="px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase font-body bg-transparent text-dark-deep border border-dark-deep hover:bg-dark-deep hover:text-white transition-colors"
                  >
                    {showWithdrawalForm
                      ? (lang === 'de' ? 'Widerrufsformular ausblenden' : 'Hide Withdrawal Form')
                      : (lang === 'de' ? 'Widerrufsformular anzeigen' : 'Show Withdrawal Form')}
                  </button>

                  {showWithdrawalForm && (
                    <div className="mt-5 border border-border p-7 bg-white font-heading text-sm leading-[1.8] text-dark">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-text font-body mb-4">
                        {lang === 'de' ? 'Muster-Widerrufsformular' : 'Sample Withdrawal Form'}
                      </p>
                      <p className="italic mb-4">
                        {lang === 'de'
                          ? '(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)'
                          : '(If you wish to withdraw from this contract, please fill out this form and return it.)'}
                      </p>
                      <p>
                        {lang === 'de' ? 'An:' : 'To:'}<br />
                        TIC ORIGINALS<br />
                        An der Oberen Au 4, 85072 Eichstätt<br />
                        company@ticoriginals.com
                      </p>
                      <br />
                      <p>
                        {lang === 'de'
                          ? 'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):'
                          : 'I/We (*) hereby withdraw from the contract concluded by me/us (*) for the purchase of the following goods (*):'}<br /><br />
                        ____________________________________________<br /><br />
                        {lang === 'de' ? 'Bestellt am (*):' : 'Ordered on (*):'} ________________________<br />
                        {lang === 'de' ? 'Erhalten am (*):' : 'Received on (*):'} ________________________<br />
                        {lang === 'de' ? 'Name des/der Verbraucher(s):' : 'Name of consumer(s):'} ________________________<br />
                        {lang === 'de' ? 'Anschrift des/der Verbraucher(s):' : 'Address of consumer(s):'}<br />
                        ____________________________________________<br /><br />
                        {lang === 'de' ? 'Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):' : 'Signature of consumer(s) (only if notifying on paper):'}<br /><br />
                        ________________________<br /><br />
                        {lang === 'de' ? 'Datum:' : 'Date:'} ________________________
                      </p>
                      <p className="text-xs text-gray-text mt-4 italic">
                        {lang === 'de' ? '(*) Unzutreffendes streichen.' : '(*) Delete as applicable.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer note */}
        {page?.last_updated && (
          <div className="mt-16 pt-6 border-t border-border">
            <p className="text-xs text-gray-text font-body tracking-wide">
              {lang === 'de' ? 'Zuletzt aktualisiert:' : 'Last updated:'} {page.last_updated}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}