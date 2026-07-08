import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Check, X, Plus, Search } from 'lucide-react';

/**
 * Multi-select product picker used by admin. Shows products by name (not raw
 * IDs) and supports either "set-of-ids" mode (default) where duplicates aren't
 * meaningful (discount code applicable products), or "list-with-duplicates"
 * mode where the same product can appear multiple times (bundles that stack
 * quantities).
 */
export default function ProductMultiPicker({ value = [], onChange, allowDuplicates = false, label }) {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-picker'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
  });
  const [search, setSearch] = useState('');

  const productById = useMemo(() => {
    const m = {};
    products.forEach((p) => { m[p.id] = p; });
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => p.name?.toLowerCase().includes(s));
  }, [products, search]);

  const add = (id) => {
    if (!allowDuplicates && value.includes(id)) return;
    onChange([...value, id]);
  };

  const removeAt = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {label && <p className="text-xs tracking-wider uppercase text-gray-text mb-2">{label}</p>}

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((id, idx) => {
            const p = productById[id];
            return (
              <span key={`${id}-${idx}`} className="inline-flex items-center gap-2 bg-dark-deep text-white text-xs px-3 py-1.5">
                {p?.name || id}
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="hover:text-red-300"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Search + product list */}
      <div className="border">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Produkt suchen…"
            className="h-8 border-0 shadow-none px-0 focus-visible:ring-0 rounded-none"
          />
        </div>
        <div className="max-h-52 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-xs text-gray-text px-3 py-4">Keine Produkte gefunden.</p>
          )}
          {filtered.map((p) => {
            const selected = value.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                  selected && !allowDuplicates ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={selected && !allowDuplicates}
              >
                <span className="flex items-center gap-2">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 object-cover" />}
                  <span>{p.name}</span>
                </span>
                {selected && !allowDuplicates ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-text" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {allowDuplicates && (
        <p className="text-[10px] text-gray-text mt-1">
          Tipp: Produkt mehrfach hinzufügen für Mengenangabe (z.B. 2×).
        </p>
      )}
    </div>
  );
}