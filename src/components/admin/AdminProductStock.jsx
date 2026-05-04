import React from 'react';
import { Input } from '@/components/ui/input';

// Builds a matrix of color × size from the product's colors and sizes arrays
// stock format: [{ color, size, quantity }]
export default function AdminProductStock({ colors = [], sizes = [], stock = [], onChange }) {
  const getQty = (color, size) => {
    const entry = stock.find((s) => s.color === color && s.size === size);
    return entry?.quantity ?? 0;
  };

  const setQty = (color, size, qty) => {
    const quantity = Math.max(0, parseInt(qty || '0', 10) || 0);
    const others = stock.filter((s) => !(s.color === color && s.size === size));
    onChange([...others, { color, size, quantity }]);
  };

  if (colors.length === 0 || sizes.length === 0) {
    return <p className="text-xs text-gray-text">Add colors and sizes first to set stock.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 border-b font-medium text-gray-text">Color \ Size</th>
            {sizes.map((s) => (
              <th key={s} className="p-2 border-b font-medium text-gray-text uppercase">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((c) => (
            <tr key={c}>
              <td className="p-2 border-b font-medium">{c}</td>
              {sizes.map((s) => (
                <td key={s} className="p-1 border-b">
                  <Input
                    type="number"
                    min="0"
                    value={getQty(c, s)}
                    onChange={(e) => setQty(c, s, e.target.value)}
                    className="h-8 text-center text-xs"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}