import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { submitContactMessage } from '@/functions/submitContactMessage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await submitContactMessage(form);
    toast({ title: '✓', description: t('contact.sent') });
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="grain-overlay bg-dark-deep text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-cyan" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">03 / Contact</p>
            </div>
            <h1 className="font-display uppercase leading-[0.85] text-[16vw] md:text-[10vw] lg:text-[140px]">
              {lang === 'de' ? 'Sag' : 'Say'} <span className="text-cyan">Hi.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm md:text-base text-white/60">
              {lang === 'de'
                ? 'Fragen, Ideen, Kollabs? Wir hören zu. Schreib uns und wir melden uns.'
                : 'Questions, ideas, collabs? We listen. Drop us a line and we\'ll be in touch.'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 md:gap-16">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text">— {lang === 'de' ? 'Nachricht senden' : 'Send Message'}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-gray-text block mb-2">{t('contact.name')}</label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="rounded-none border-0 border-b border-dark bg-transparent px-0 focus-visible:ring-0 focus-visible:border-cyan h-12"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-gray-text block mb-2">{t('contact.email')}</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="rounded-none border-0 border-b border-dark bg-transparent px-0 focus-visible:ring-0 focus-visible:border-cyan h-12"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-gray-text block mb-2">{t('contact.subject')}</label>
              <Input
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="rounded-none border-0 border-b border-dark bg-transparent px-0 focus-visible:ring-0 focus-visible:border-cyan h-12"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-gray-text block mb-2">{t('contact.message')}</label>
              <Textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                required
                rows={6}
                className="rounded-none border-0 border-b border-dark bg-transparent px-0 focus-visible:ring-0 focus-visible:border-cyan resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-3 bg-dark-deep text-white px-8 py-5 text-[11px] tracking-[0.3em] uppercase hover:bg-cyan hover:text-dark-deep transition-colors group disabled:opacity-40 w-full sm:w-auto justify-center"
            >
              {sending ? '...' : t('contact.send')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-8 lg:pl-8 lg:border-l lg:border-border">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gray-text mb-3">— HQ</p>
              <p className="font-display text-3xl md:text-4xl uppercase leading-tight">TIC Originals</p>
              <p className="text-xs tracking-[0.2em] uppercase text-cyan mt-2">EST. 2024 · Germany</p>
            </div>

            <div className="space-y-5 pt-4 border-t border-border">
              <a href="mailto:company@ticoriginals.com" className="flex items-start gap-4 group">
                <div className="w-10 h-10 border border-border flex items-center justify-center shrink-0 group-hover:border-cyan group-hover:text-cyan transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gray-text">Email</p>
                  <p className="text-sm mt-1 group-hover:text-cyan transition-colors">company@ticoriginals.com</p>
                </div>
              </a>

              <a href="tel:+4915207889847" className="flex items-start gap-4 group">
                <div className="w-10 h-10 border border-border flex items-center justify-center shrink-0 group-hover:border-cyan group-hover:text-cyan transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gray-text">Phone</p>
                  <p className="text-sm mt-1 group-hover:text-cyan transition-colors">+49 152 07889847</p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-border flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gray-text">Address</p>
                  <p className="text-sm mt-1">An der Oberen Au 4<br />85072 Eichstätt, Germany</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}