import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import ProductMultiPicker from './ProductMultiPicker';

const EMPTY_FORM = {
  name: '',
  product_ids: [],
  normal_price: '',
  bundle_price: '',
  bundle_sale_price: '',
  sale_valid_until: '',
  items_summary: '',
  is_active: true,
};

export default function AdminBundles() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: bundles = [] } = useQuery({
    queryKey: ['admin-bundles'],
    queryFn: () => base44.entities.Bundle.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Bundle.update(editing.id, data)
      : base44.entities.Bundle.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-bundles']);
      qc.invalidateQueries(['public-bundles']);
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Bundle.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-bundles']);
      qc.invalidateQueries(['public-bundles']);
    },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name || '',
      product_ids: b.product_ids || [],
      normal_price: b.normal_price ?? '',
      bundle_price: b.bundle_price ?? '',
      bundle_sale_price: b.bundle_sale_price ?? '',
      sale_valid_until: b.sale_valid_until || '',
      items_summary: b.items_summary || '',
      is_active: b.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.product_ids.length || !form.normal_price || !form.bundle_price) return;
    const data = {
      name: form.name,
      product_ids: form.product_ids,
      normal_price: Number(form.normal_price),
      bundle_price: Number(form.bundle_price),
      bundle_sale_price: form.bundle_sale_price !== '' ? Number(form.bundle_sale_price) : undefined,
      sale_valid_until: form.sale_valid_until || undefined,
      items_summary: form.items_summary || undefined,
      is_active: form.is_active,
    };
    saveMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl">Bundles</h2>
        <Button onClick={openCreate} className="gap-2 rounded-none text-xs tracking-wider uppercase bg-dark text-white hover:bg-dark-light">
          <Plus className="w-4 h-4" /> Neues Bundle
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs tracking-wider uppercase text-gray-text">
              <th className="text-left py-3 pr-4">Name</th>
              <th className="text-left py-3 pr-4">Produkte</th>
              <th className="text-left py-3 pr-4">Normal</th>
              <th className="text-left py-3 pr-4">Bundle</th>
              <th className="text-left py-3 pr-4">Sale</th>
              <th className="text-left py-3 pr-4">Sale bis</th>
              <th className="text-left py-3 pr-4">Status</th>
              <th className="text-right py-3">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bundles.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-gray-text text-xs">Keine Bundles vorhanden</td></tr>
            )}
            {bundles.map((b) => (
              <tr key={b.id} className="hover:bg-muted/50">
                <td className="py-3 pr-4 font-medium">{b.name}</td>
                <td className="py-3 pr-4 text-gray-text">{(b.product_ids || []).length}x</td>
                <td className="py-3 pr-4 text-gray-text line-through">€{b.normal_price?.toFixed(2)}</td>
                <td className="py-3 pr-4 font-medium">€{b.bundle_price?.toFixed(2)}</td>
                <td className="py-3 pr-4 text-red-600">{b.bundle_sale_price != null ? `€${b.bundle_sale_price.toFixed(2)}` : '—'}</td>
                <td className="py-3 pr-4 text-gray-text">{b.sale_valid_until ? format(new Date(b.sale_valid_until), 'dd.MM.yyyy') : '—'}</td>
                <td className="py-3 pr-4">
                  {b.is_active
                    ? <Badge className="bg-green-100 text-green-700 border-0 text-xs">Aktiv</Badge>
                    : <Badge variant="outline" className="text-xs">Inaktiv</Badge>}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-muted rounded"><Pencil className="w-3.5 h-3.5 text-gray-text" /></button>
                    <button onClick={() => deleteMutation.mutate(b.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-light text-xl">
              {editing ? 'Bundle bearbeiten' : 'Neues Bundle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs tracking-wider uppercase">Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-none mt-1" placeholder="Starter Pack" />
            </div>
            <ProductMultiPicker
              label="Produkte * (mehrfach für Mengen)"
              value={form.product_ids}
              onChange={(ids) => setForm(p => ({ ...p, product_ids: ids }))}
              allowDuplicates
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider uppercase">Normalpreis € *</Label>
                <Input type="number" step="0.01" value={form.normal_price} onChange={e => setForm(p => ({ ...p, normal_price: e.target.value }))} className="rounded-none mt-1" />
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">Bundle-Preis € *</Label>
                <Input type="number" step="0.01" value={form.bundle_price} onChange={e => setForm(p => ({ ...p, bundle_price: e.target.value }))} className="rounded-none mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider uppercase">Aktions-Preis € (optional)</Label>
                <Input type="number" step="0.01" value={form.bundle_sale_price} onChange={e => setForm(p => ({ ...p, bundle_sale_price: e.target.value }))} className="rounded-none mt-1" />
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">Sale gültig bis</Label>
                <Input type="date" value={form.sale_valid_until} onChange={e => setForm(p => ({ ...p, sale_valid_until: e.target.value }))} className="rounded-none mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">Kurzbeschreibung</Label>
              <Input value={form.items_summary} onChange={e => setForm(p => ({ ...p, items_summary: e.target.value }))} className="rounded-none mt-1" placeholder="2x tee, freie Kombination" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4" />
              Aktiv
            </label>
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