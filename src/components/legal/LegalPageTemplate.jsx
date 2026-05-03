import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export default function LegalPageTemplate({ slug }) {
  const [page, setPage] = useState(null);
  const [lang, setLang] = useState('de');
  const [loading, setLoading] = useState(true);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    base44.entities.LegalPage.filter({ slug })
      .then(results => {
        if (results.length > 0) setPage(results[0]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const title = page ? (lang === 'de' ? page.title_de : (page.title_en || page.title_de)) : '';
  const subtitle = page ? (lang === 'de' ? page.subtitle_de : (page.subtitle_en || page.subtitle_de)) : '';
  const rawContent = page ? (lang === 'de' ? page.content_de : (page.content_en || page.content_de)) : null;

  let sections = [];
  if (rawContent) {
    try { sections = JSON.parse(rawContent); } catch { sections = []; }
  }

  const scrollTo = (id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div style={{ background: '#fafaf8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#999', fontSize: '14px', letterSpacing: '0.1em' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#0a0a0a', color: '#fff', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9EF2FF', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
                TIC ORIGINALS
              </p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 300, lineHeight: 1.15, margin: 0 }}>
                {title || slug}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '14px', color: '#aaa', marginTop: '10px', fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>
              )}
            </div>
            {/* Language Toggle */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexShrink: 0 }}>
              <button
                onClick={() => setLang('de')}
                style={{
                  padding: '6px 14px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  background: lang === 'de' ? '#9EF2FF' : 'transparent',
                  color: lang === 'de' ? '#0a0a0a' : '#9EF2FF',
                  border: '1px solid #9EF2FF', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s'
                }}
              >DE</button>
              <button
                onClick={() => setLang('en')}
                style={{
                  padding: '6px 14px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  background: lang === 'en' ? '#9EF2FF' : 'transparent',
                  color: lang === 'en' ? '#0a0a0a' : '#9EF2FF',
                  border: '1px solid #9EF2FF', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s'
                }}
              >EN</button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Nav */}
      {sections.length > 0 && (
        <div style={{ background: '#0a0a0a', borderTop: '1px solid #222' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
              {sections.map((sec, i) => (
                <button
                  key={sec.id || i}
                  onClick={() => scrollTo(sec.id || `section-${i}`)}
                  style={{
                    padding: '12px 16px', fontSize: '11px', letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#666', background: 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    transition: 'color 0.2s', whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => e.target.style.color = '#9EF2FF'}
                  onMouseLeave={e => e.target.style.color = '#666'}
                >
                  {sec.id || `§${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {sections.length === 0 && !loading && (
          <p style={{ color: '#999', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            {lang === 'de' ? 'Inhalt wird geladen…' : 'Content coming soon…'}
          </p>
        )}

        {sections.map((sec, i) => {
          const sectionId = sec.id || `section-${i}`;
          return (
            <div
              key={sectionId}
              ref={el => sectionRefs.current[sectionId] = el}
              style={{
                borderTop: i === 0 ? 'none' : '1px solid #e8e6e0',
                paddingTop: i === 0 ? 0 : '40px',
                marginTop: i === 0 ? 0 : '40px',
                background: sec.note ? '#f0ede6' : 'transparent',
                padding: sec.note ? '24px' : (i === 0 ? '0' : '40px 0 0 0'),
                marginTop: sec.note ? '40px' : (i === 0 ? 0 : '40px'),
                borderRadius: sec.note ? '2px' : 0,
              }}
            >
              {sec.heading && (
                <p style={{
                  fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#999', fontFamily: 'Inter, sans-serif', marginBottom: '14px', fontWeight: 500
                }}>
                  {sec.heading}
                </p>
              )}
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: '15px', lineHeight: 1.85,
                color: '#2a2a2a', whiteSpace: 'pre-line',
                fontStyle: sec.note ? 'italic' : 'normal'
              }}>
                {sec.body}
              </div>

              {/* Withdrawal Form Toggle (AGB § Widerrufsrecht) */}
              {sec.hasForm && (
                <div style={{ marginTop: '24px' }}>
                  <button
                    onClick={() => setShowWithdrawalForm(v => !v)}
                    style={{
                      padding: '10px 20px', fontSize: '11px', letterSpacing: '0.15em',
                      textTransform: 'uppercase', background: 'transparent',
                      color: '#0a0a0a', border: '1px solid #0a0a0a', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.target.style.background = '#0a0a0a'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#0a0a0a'; }}
                  >
                    {showWithdrawalForm
                      ? (lang === 'de' ? 'Widerrufsformular ausblenden' : 'Hide Withdrawal Form')
                      : (lang === 'de' ? 'Widerrufsformular anzeigen' : 'Show Withdrawal Form')}
                  </button>

                  {showWithdrawalForm && (
                    <div style={{
                      marginTop: '20px', border: '1px solid #ccc', padding: '28px',
                      background: '#fff', fontFamily: 'Georgia, serif', fontSize: '14px',
                      lineHeight: 1.8, color: '#333'
                    }}>
                      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
                        {lang === 'de' ? 'Muster-Widerrufsformular' : 'Sample Withdrawal Form'}
                      </p>
                      <p style={{ fontStyle: 'italic', marginBottom: '16px' }}>
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
                      <p style={{ fontSize: '12px', color: '#999', marginTop: '16px', fontStyle: 'italic' }}>
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
          <div style={{ marginTop: '60px', paddingTop: '24px', borderTop: '1px solid #e8e6e0' }}>
            <p style={{ fontSize: '12px', color: '#aaa', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>
              {lang === 'de' ? 'Zuletzt aktualisiert:' : 'Last updated:'} {page.last_updated}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}