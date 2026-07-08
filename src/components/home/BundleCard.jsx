import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { getBundleActivePrice } from '@/lib/flashSale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function BundleCard({ bundle }) {
  const { addBundle } = useCart();
  const { lang } = useLanguage();
  const priceInfo = getBundleActivePrice(bundle);
  const [open, setOpen] = useState(false);
  // selections[i] = { color, size } for products[i]
  const [selections, setSelections] = useState(
    (bundle.products || []).map((p) => ({
      color: p?.colors?.[0] || '',
      size: p?.sizes?.[0] || '',
    }))
  );

  if (!priceInfo) return null;
  const savings = bundle.normal_price - priceInfo.activePrice;
  const savingsPct = bundle.normal_price > 0
    ? Math.round((savings / bundle.normal_price) * 100)
    : 0;

  const heroImages = (bundle.products || []).slice(0, 3).map((p) => p?.images?.[0]).filter(Boolean);

  const updateSelection = (idx, field, value) => {
    setSelections((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleAdd = () => {
    addBundle(bundle, selections, priceInfo.activePrice);
    setOpen(false);
  };

  return (
    <>
      <div className="group border border-border bg-white flex flex-col hover:border-dark-deep transition-colors">
        {/* Image mosaic */}
        <div className="aspect-[4/3] bg-muted overflow-hidden relative">
          <div className={`w-full h-full grid gap-0.5 ${heroImages.length === 1 ? 'grid-cols-1' : heroImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {heroImages.length > 0 ? heroImages.map((img, i) => (
              <div key={i} className="bg-muted overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )) : (
              <div className="flex items-center justify-center bg-gradient-to-br from-dark to-dark-deep col-span-full">
                <span className="font-display text-5xl text-cyan/30 tracking-widest">TIC</span>
              </div>
            )}
          </div>
          {priceInfo.isOnSale && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] tracking-[0.2em] uppercase px-2 py-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {lang === 'de' ? 'Aktion' : 'Sale'}
            </div>
          )}
          {savingsPct > 0 && (
            <div className="absolute top-3 right-3 bg-cyan text-dark-deep text-[10px] tracking-[0.2em] uppercase px-2 py-1 font-medium">
              −{savingsPct}%
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display text-xl md:text-2xl uppercase tracking-wider mb-1">{bundle.name}</h3>
          <p className="text-xs text-gray-text leading-relaxed mb-4">{bundle.items_summary}</p>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-2xl md:text-3xl tabular-nums text-dark-deep">
                €{priceInfo.activePrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-text line-through tabular-nums">
                €{bundle.normal_price.toFixed(2)}
              </span>
            </div>
            {priceInfo.isOnSale && (
              <p className="text-[10px] tracking-[0.2em] uppercase text-red-600 mb-3">
                {lang === 'de' ? 'Statt' : 'Was'} €{bundle.bundle_price.toFixed(2)}
              </p>
            )}
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-text mb-4">
              {lang === 'de' ? 'Du sparst' : 'You save'} €{savings.toFixed(2)}
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="w-full bg-dark-deep text-white hover:bg-cyan hover:text-dark-deep rounded-none text-[11px] tracking-[0.25em] uppercase py-6"
            >
              <ShoppingBag className="w-4 h-4" />
              {lang === 'de' ? 'Bundle in Warenkorb' : 'Add bundle to cart'}
            </Button>
          </div>
        </div>
      </div>

      {/* Selection dialog — one row per product in the bundle */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider text-2xl">{bundle.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {(bundle.products || []).map((product, idx) => (
              <div key={`${product.id}-${idx}`} className="border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt="" className="w-14 h-14 object-cover" />
                  )}
                  <p className="font-heading text-sm leading-tight flex-1">{product.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {product.colors?.length > 0 && (
                    <div>
                      <Label className="text-[10px] tracking-[0.2em] uppercase text-gray-text">
                        {lang === 'de' ? 'Farbe' : 'Color'}
                      </Label>
                      <Select
                        value={selections[idx]?.color}
                        onValueChange={(v) => updateSelection(idx, 'color', v)}
                      >
                        <SelectTrigger className="rounded-none mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {product.colors.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {product.sizes?.length > 0 && (
                    <div>
                      <Label className="text-[10px] tracking-[0.2em] uppercase text-gray-text">
                        {lang === 'de' ? 'Größe' : 'Size'}
                      </Label>
                      <Select
                        value={selections[idx]?.size}
                        onValueChange={(v) => updateSelection(idx, 'size', v)}
                      >
                        <SelectTrigger className="rounded-none mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {product.sizes.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-t pt-4">
              <span className="text-xs tracking-wider uppercase text-gray-text">
                {lang === 'de' ? 'Bundle-Preis' : 'Bundle price'}
              </span>
              <span className="font-display text-2xl tabular-nums">€{priceInfo.activePrice.toFixed(2)}</span>
            </div>
            <Button
              onClick={handleAdd}
              className="w-full bg-cyan text-dark-deep hover:bg-cyan-dark rounded-none text-[11px] tracking-[0.25em] uppercase py-6"
            >
              {lang === 'de' ? 'In den Warenkorb' : 'Add to cart'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}