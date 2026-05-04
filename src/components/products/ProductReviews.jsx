import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              n <= (hovered || value) ? 'fill-cyan text-cyan' : 'fill-transparent text-border'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author_name: '', rating: 0, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId, is_approved: true }, '-created_date'),
  });

  const { data: myReview } = useQuery({
    queryKey: ['my-review', productId, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const list = await base44.entities.Review.filter({ product_id: productId, created_by: user.email });
      return list[0] || null;
    },
    enabled: !!user?.email,
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['my-review', productId] });
      setSubmitted(true);
      setShowForm(false);
      setForm({ author_name: '', rating: 0, comment: '' });
    },
    onError: (err) => {
      setSubmitError(err?.message || 'Failed to submit');
    },
  });

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.author_name || form.rating === 0) return;
    mutation.mutate({ ...form, product_id: productId });
  };

  const labels = {
    en: { title: 'Customer Reviews', write: 'Write a Review', name: 'Your Name', comment: 'Your Review (optional)', submit: 'Submit Review', cancel: 'Cancel', thanks: 'Thank you! Your review will appear after admin approval.', noReviews: 'Be the first to review this product.', signIn: 'Sign In', alreadyReviewed: 'You have already reviewed this product.' },
    de: { title: 'Kundenbewertungen', write: 'Bewertung schreiben', name: 'Dein Name', comment: 'Deine Bewertung (optional)', submit: 'Bewertung absenden', cancel: 'Abbrechen', thanks: 'Danke! Deine Bewertung erscheint nach Admin-Freigabe.', noReviews: 'Sei der Erste, der dieses Produkt bewertet.', signIn: 'Anmelden', alreadyReviewed: 'Du hast dieses Produkt bereits bewertet.' },
  };
  const l = labels[lang] || labels.en;

  const canShowWriteButton = !showForm && !submitted && !myReview;

  return (
    <div className="border-t pt-16 mt-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-gray-text mb-1">TIC ORIGINALS</p>
          <h2 className="font-heading text-3xl font-light">{l.title}</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating value={Math.round(avgRating)} readonly />
              <span className="text-sm text-gray-text">{avgRating.toFixed(1)} / 5 · {reviews.length} {lang === 'de' ? 'Bewertungen' : 'reviews'}</span>
            </div>
          )}
        </div>
        {canShowWriteButton && (
          isAuthenticated ? (
            <Button
              onClick={() => {
                setForm(f => ({ ...f, author_name: user?.full_name || '' }));
                setShowForm(true);
              }}
              variant="outline"
              className="rounded-none border-dark text-xs tracking-[0.15em] uppercase px-8 py-5"
            >
              {l.write}
            </Button>
          ) : (
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              variant="outline"
              className="rounded-none border-dark text-xs tracking-[0.15em] uppercase px-8 py-5"
            >
              <LogIn className="w-3.5 h-3.5 mr-2" />
              {l.signIn}
            </Button>
          )
        )}
      </div>

      {myReview && !submitted && (
        <div className="bg-muted/40 text-sm px-5 py-4 mb-8 border">
          {l.alreadyReviewed}
        </div>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm px-5 py-4 mb-8 border border-emerald-200"
        >
          {l.thanks}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-10 bg-muted/40 border p-6 space-y-5"
          >
            <div>
              <p className="text-xs tracking-[0.15em] uppercase mb-2">{lang === 'de' ? 'Bewertung' : 'Rating'} *</p>
              <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] uppercase mb-2">{l.name} *</p>
              <Input
                value={form.author_name}
                onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                placeholder="Max M."
                className="rounded-none"
                required
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] uppercase mb-2">{l.comment}</p>
              <Textarea
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                rows={4}
                className="rounded-none resize-none"
              />
            </div>
            {submitError && <p className="text-xs text-red-600">{submitError}</p>}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={mutation.isPending || form.rating === 0 || !form.author_name}
                className="bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-xs tracking-[0.15em] uppercase px-8"
              >
                {mutation.isPending ? '...' : l.submit}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="rounded-none text-xs tracking-[0.15em] uppercase"
              >
                {l.cancel}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-text py-8">{l.noReviews}</p>
      ) : (
        <div className="space-y-8">
          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-b pb-8 last:border-0"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-medium text-sm">{review.author_name}</p>
                  <p className="text-xs text-gray-text">
                    {review.created_date ? format(new Date(review.created_date), 'dd MMM yyyy') : ''}
                  </p>
                </div>
                <StarRating value={review.rating} readonly />
              </div>
              {review.comment && (
                <p className="text-sm text-dark/80 leading-relaxed mt-3">{review.comment}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}