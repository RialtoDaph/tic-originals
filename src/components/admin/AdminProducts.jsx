import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminProducts({ products }) {
  const queryClient = useQueryClient();
  const [editProduct, setEditProduct] = useState(null);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', description_en: '', description_de: '',
    price: '', category: '', colors: '', sizes: '', is_active: true
  });

  const openNew = () => {
    setEditProduct(null);
    setForm({ name: '', slug: '', description_en: '', description_de: '', price: '', category: '', colors: '', sizes: '', is_active: true });
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name || '', slug: p.slug || '',
      description_en: p.description_en || '', description_de: p.description_de || '',
      price: p.price?.toString() || '', category: p.category || '',
      colors: (p.colors || []).join(', '), sizes: (p.sizes || []).join(', '),
      is_active: p.is_active !== false
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      price: parseFloat(form.price) || 0,
      colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
    };
    if (editProduct) {
      await base44.entities.Product.update(editProduct.id, data);
    } else {
      await base44.entities.Product.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    setOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await base44.entities.Product.delete(id);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm tracking-wider uppercase">Products ({products.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew} className="bg-cyan text-dark-deep hover:bg-cyan-dark">
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Price (€)</Label>
                    <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description (EN)</Label>
                  <Textarea value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} rows={2} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Description (DE)</Label>
                  <Textarea value={form.description_de} onChange={e => setForm({ ...form, description_de: e.target.value })} rows={2} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Colors (comma separated)</Label>
                  <Input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} className="mt-1" placeholder="Schwarz, Weiß, Grau" />
                </div>
                <div>
                  <Label className="text-xs">Sizes (comma separated)</Label>
                  <Input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} className="mt-1" placeholder="XS, S, M, L" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                  <Label className="text-xs">Active</Label>
                </div>
                <Button onClick={handleSave} className="w-full bg-cyan text-dark-deep hover:bg-cyan-dark">
                  {editProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-text">€{p.price?.toFixed(2)} · {p.colors?.join(', ')} · {p.sizes?.join(', ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-gray-text'}`}>
                  {p.is_active !== false ? 'Active' : 'Inactive'}
                </span>
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-center text-gray-text py-8">No products yet</p>}
        </div>
      </CardContent>
    </Card>
  );
}