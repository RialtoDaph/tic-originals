import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { submitContactMessage } from '@/functions/submitContactMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-3">TIC ORIGINALS</p>
        <h1 className="font-heading text-5xl font-light">{t('contact.title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-xs tracking-wider uppercase">{t('contact.name')}</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="rounded-none mt-1" />
          </div>
          <div>
            <Label className="text-xs tracking-wider uppercase">{t('contact.email')}</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="rounded-none mt-1" />
          </div>
          <div>
            <Label className="text-xs tracking-wider uppercase">{t('contact.subject')}</Label>
            <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="rounded-none mt-1" />
          </div>
          <div>
            <Label className="text-xs tracking-wider uppercase">{t('contact.message')}</Label>
            <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={6} className="rounded-none mt-1" />
          </div>
          <Button type="submit" disabled={sending}
            className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-[0.2em] uppercase w-full py-6">
            {sending ? '...' : t('contact.send')}
          </Button>
        </form>

        <div className="space-y-8">
          <div>
            <h3 className="font-heading text-2xl mb-6">TIC ORIGINALS</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-text" />
                <p className="text-sm text-gray-text">An der Oberen Au 4<br />85072 Eichstätt, Germany</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-text" />
                <a href="mailto:company@ticoriginals.com" className="text-sm text-gray-text hover:text-dark transition-colors">company@ticoriginals.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-text" />
                <a href="tel:+4915206234894" className="text-sm text-gray-text hover:text-dark transition-colors">+49 152 06234894</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}