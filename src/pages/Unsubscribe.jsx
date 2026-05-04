import React, { useEffect, useState } from 'react';
import { unsubscribeNewsletter } from '@/functions/unsubscribeNewsletter';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Unsubscribe() {
  const { lang } = useLanguage();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const token = params.get('token') || '';

    if (!email) {
      setStatus('error');
      setErrorMsg(lang === 'de' ? 'E-Mail fehlt im Link' : 'Email missing in link');
      return;
    }

    unsubscribeNewsletter({ email, token })
      .then((res) => {
        if (res?.data?.success) setStatus('success');
        else {
          setStatus('error');
          setErrorMsg(res?.data?.error || 'Failed');
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err?.message || 'Failed');
      });
  }, [lang]);

  const copy = {
    en: {
      title: 'Newsletter Unsubscribe',
      loading: 'Processing your request...',
      success: 'You have been unsubscribed successfully.',
      error: 'Something went wrong:',
      back: 'Back to Home',
    },
    de: {
      title: 'Newsletter abmelden',
      loading: 'Anfrage wird verarbeitet...',
      success: 'Du wurdest erfolgreich abgemeldet.',
      error: 'Etwas ist schiefgelaufen:',
      back: 'Zur Startseite',
    },
  };
  const c = copy[lang] || copy.en;

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-heading text-3xl font-light mb-8">{c.title}</h1>
      <div className="border p-10 space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 mx-auto text-cyan animate-spin" />
            <p className="text-sm text-gray-text">{c.loading}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
            <p className="text-sm">{c.success}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 mx-auto text-red-600" />
            <p className="text-sm text-red-700">{c.error}</p>
            <p className="text-xs text-gray-text">{errorMsg}</p>
          </>
        )}
        <Link to="/" className="block text-xs tracking-[0.15em] uppercase text-gray-text hover:text-dark mt-6">
          {c.back}
        </Link>
      </div>
    </div>
  );
}