import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { format } from 'date-fns';
import ProductMultiPicker from './ProductMultiPicker';

const EMPTY_FORM = {
  code: '', description: '', discount_type: 'percentage', discount_value: '',
  minimum_order_amount: 0, maximum_discount_amount: '',
  usage_limit: '', usage_limit_per_customer: 1,
  is_first_order_only: false, valid_from: '', valid_until: '', is_active: true,
  applicable_product_ids: [],
};

function validate(form) {
  const errors = {};
  if (!form.code || !/^[A-Z0-9]+$/.test(form.code)) errors.code = 'Nur Großbuchstaben und Zahlen erlaubt';
  if (!form.discount_value || Number(form.discount_value) <= 0) errors.discount_value = 'Muss > 0 sein';
  if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) errors.discount_value = 'Muss zwischen 1–100 liegen';
  if (form.valid_from && form.valid_until && form.valid_until < form.valid_from) errors.valid_until = 'Muss nach Startdatum liegen';
  return errors;
}

export default function AdminDiscountCodes() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const { data: codes = [] } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: () => base44.entities.DiscountCode.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.DiscountCode.update(editing.id, data)
      : base44.entities.DiscountCode.create(data),
    onSuccess: () => { qc.invalidateQueries(['discount-codes']); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscountCode.delete(id),
    onSuccess: () => qc.invalidateQueries(['discount-codes']),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.DiscountCode.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries(['discount-codes']),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setDialogOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || '', discount_type: c.discount_type,
      discount_value: c.discount_value, minimum_order_amount: c.minimum_order_amount ?? 0,
      maximum_discount_amount: c.maximum_discount_amount ?? '',
      usage_limit: c.usage_limit ?? '', usage_limit_per_customer: c.usage_limit_per_customer ?? 1,
      is_first_order_only: c.is_first_order_only ?? false,
      valid_from: c.valid_from ?? '', valid_until: c.valid_until ?? '', is_active: c.is_active ?? true,
      applicable_product_ids: c.applicable_product_ids ?? [],
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const data = {
      ...form,
      code: form.code.toUpperCase(),
      discount_value: Number(form.discount_value),
      minimum_order_amount: Number(form.minimum_order_amount) || 0,
      maximum_discount_amount: form.maximum_discount_amount !== '' ? Number(form.maximum_discount_amount) : undefined,
      usage_limit: form.usage_limit !== '' ? Number(form.usage_limit) : undefined,
      usage_limit_per_customer: Number(form.usage_limit_per_customer) || 1,
      valid_from: form.valid_from || undefined,
      valid_until: form.valid_until || undefined,
      applicable_product_ids: form.applicable_product_ids || [],
    };
    saveMutation.mutate(data);
  };

  const activeCount = codes.filter(c => c.is_active).length;
  const inactiveCount = codes.filter(c => !c.is_active).length;
  const totalUsed = codes.reduce((s, c) => s + (c.used_count || 0), 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Aktive Codes', value: activeCount },
          { label: 'Gesamt genutzt', value: totalUsed },
          { label: 'Inaktive Codes', value: inactiveCount },
        ].map(s => (
          <div key={s.label} className="border p-4">
            <p className="text-xs tracking-wider uppercase text-gray-text mb-1">{s.label}</p>
            <p className="font-heading text-3xl font-light">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl">Rabattcodes</h2>
        <Button onClick={openCreate} className="gap-2 rounded-none text-xs tracking-wider uppercase bg-dark text-white hover:bg-dark-light">
          <Plus className="w-4 h-4" /> Neuen Code erstellen
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs tracking-wider uppercase text-gray-text">
              <th className="text-left py-3 pr-4">Code</th>
              <th className="text-left py-3 pr-4">Typ</th>
              <th className="text-left py-3 pr-4">Wert</th>
              <th className="text-left py-3 pr-4">Min. Bestellwert</th>
              <th className="text-left py-3 pr-4">Gültig bis</th>
              <th className="text-left py-3 pr-4">Nutzung</th>
              <th className="text-left py-3 pr-4">Pro Kunde</th>
              <th className="text-left py-3 pr-4">Erstbestellung</th>
              <th className="text-left py-3 pr-4">Status</th>
              <th className="text-right py-3">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codes.length === 0 && (
              <tr><td colSpan={10} className="py-8 text-center text-gray-text text-xs">Keine Codes vorhanden</td></tr>
            )}
            {codes.map(c => (
              <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                <td className="py-3 pr-4">
                  <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5">{c.code}</span>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant="outline" className="text-xs">
                    {c.discount_type === 'percentage' ? '%' : '€'}
                  </Badge>
                </td>
                <td className="py-3 pr-4 font-medium">
                  {c.discount_type === 'percentage' ? `${c.discount_value}%` : `€${c.discount_value}`}
                </td>
                <td className="py-3 pr-4 text-gray-text">
                  {c.minimum_order_amount > 0 ? `€${c.minimum_order_amount}` : '—'}
                </td>
                <td className="py-3 pr-4 text-gray-text">
                  {c.valid_until ? format(new Date(c.valid_until), 'dd.MM.yyyy') : '∞'}
                </td>
                <td className="py-3 pr-4 text-gray-text">
                  {c.used_count || 0}{c.usage_limit ? ` / ${c.usage_limit}` : ' / ∞'}
                </td>
                <td className="py-3 pr-4 text-gray-text">{c.usage_limit_per_customer ?? 1}x</td>
                <td className="py-3 pr-4">
                  {c.is_first_order_only
                    ? <Badge className="bg-cyan text-dark-deep text-xs">Ja</Badge>
                    : <span className="text-gray-text text-xs">Nein</span>}
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}
                    className={`text-xs px-3 py-1 border transition-colors ${c.is_active ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-border text-gray-text hover:bg-muted'}`}
                  >
                    {c.is_active ? 'Aktiv' : 'Inaktiv'}
                  </button>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-muted rounded transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-gray-text" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-light text-xl">
              {editing ? 'Code bearbeiten' : 'Neuen Code erstellen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs tracking-wider uppercase">Code *</Label>
              <Input
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                className="rounded-none mt-1 font-mono"
                placeholder="SUMMER20"
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>

            <div>
              <Label className="text-xs tracking-wider uppercase">Beschreibung</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-none mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider uppercase">Typ *</Label>
                <Select value={form.discount_type} onValueChange={v => setForm(p => ({ ...p, discount_type: v }))}>
                  <SelectTrigger className="rounded-none mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Prozent (%)</SelectItem>
                    <SelectItem value="fixed">Festbetrag (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">Wert *</Label>
                <Input
                  type="number" min="0"
                  value={form.discount_value}
                  onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                  className="rounded-none mt-1"
                  placeholder={form.discount_type === 'percentage' ? '20' : '5'}
                />
                {errors.discount_value && <p className="text-xs text-red-500 mt-1">{errors.discount_value}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider uppercase">Min. Bestellwert (€)</Label>
                <Input type="number" min="0" value={form.minimum_order_amount} onChange={e => setForm(p => ({ ...p, minimum_order_amount: e.target.value }))} className="rounded-none mt-1" />
              </div>
              {form.discount_type === 'percentage' && (
                <div>
                  <Label className="text-xs tracking-wider uppercase">Max. Rabatt (€, optional)</Label>
                  <Input type="number" min="0" value={form.maximum_discount_amount} onChange={e => setForm(p => ({ ...p, maximum_discount_amount: e.target.value }))} className="rounded-none mt-1" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider uppercase">Nutzungslimit (optional)</Label>
                <Input type="number" min="1" value={form.usage_limit} onChange={e => setForm(p => ({ ...p, usage_limit: e.target.value }))} className="rounded-none mt-1" placeholder="∞" />
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">Limit pro Kunde</Label>
                <Input type="number" min="1" value={form.usage_limit_per_customer} onChange={e => setForm(p => ({ ...p, usage_limit_per_customer: e.target.value }))} className="rounded-none mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider uppercase">Gültig ab</Label>
                <Input type="date" value={form.valid_from} onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))} className="rounded-none mt-1" />
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">Gültig bis</Label>
                <Input type="date" value={form.valid_until} onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))} className="rounded-none mt-1" />
                {errors.valid_until && <p className="text-xs text-red-500 mt-1">{errors.valid_until}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 -mt-2">
              <span className="text-xs tracking-wider uppercase text-gray-text mr-1">Schnellauswahl:</span>
              {[
                { label: '24 Std.', days: 1 },
                { label: '3 Tage', days: 3 },
                { label: '7 Tage', days: 7 },
                { label: '14 Tage', days: 14 },
                { label: '30 Tage', days: 30 },
              ].map(preset => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const until = new Date();
                    until.setDate(today.getDate() + preset.days);
                    const iso = (d) => d.toISOString().split('T')[0];
                    setForm(p => ({ ...p, valid_from: iso(today), valid_until: iso(until) }));
                  }}
                  className="text-xs tracking-wider uppercase border border-border px-2 py-1 hover:bg-muted transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <ProductMultiPicker
              label="Anwendbar auf Produkte (leer = alle; wenn gesetzt = Flash Sale mit automatischem Strikethrough im Shop)"
              value={form.applicable_product_ids}
              onChange={(ids) => setForm(p => ({ ...p, applicable_product_ids: ids }))}
            />

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_first_order_only} onChange={e => setForm(p => ({ ...p, is_first_order_only: e.target.checked }))} className="w-4 h-4" />
                Nur Erstbestellung
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4" />
                Aktiv
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none text-xs tracking-wider uppercase">Abbrechen</Button>
              <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="rounded-none text-xs tracking-wider uppercase bg-dark text-white hover:bg-dark-light">
                {saveMutation.isPending ? '...' : (editing ? 'Speichern' : 'Erstellen')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}