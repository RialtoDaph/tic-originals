import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package } from 'lucide-react';

export default function AdminInventory({ products, lowStockItems }) {
  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-sm tracking-wider uppercase flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" /> Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.product}</p>
                    <p className="text-xs text-gray-text">{item.color} / {item.size}</p>
                  </div>
                  <span className="text-sm font-medium text-amber-700">{item.quantity} left</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm tracking-wider uppercase flex items-center gap-2">
            <Package className="w-4 h-4" /> Full Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-xs tracking-wider uppercase text-gray-text">Product</th>
                  <th className="pb-3 text-left text-xs tracking-wider uppercase text-gray-text">Color</th>
                  <th className="pb-3 text-left text-xs tracking-wider uppercase text-gray-text">Size</th>
                  <th className="pb-3 text-right text-xs tracking-wider uppercase text-gray-text">Stock</th>
                  <th className="pb-3 text-right text-xs tracking-wider uppercase text-gray-text">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.flatMap(p =>
                  (p.stock || []).map((s, i) => {
                    const threshold = p.low_stock_threshold || 3;
                    const statusClass = s.quantity <= 0
                      ? 'text-destructive'
                      : s.quantity <= threshold
                        ? 'text-amber-600'
                        : 'text-emerald-600';
                    const statusText = s.quantity <= 0 ? 'Sold Out' : s.quantity <= threshold ? 'Low' : 'OK';
                    return (
                      <tr key={`${p.id}-${i}`} className="border-b last:border-0">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2 text-gray-text">{s.color}</td>
                        <td className="py-2 text-gray-text">{s.size}</td>
                        <td className="py-2 text-right font-medium">{s.quantity}</td>
                        <td className={`py-2 text-right text-xs font-medium ${statusClass}`}>{statusText}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {products.length === 0 && <p className="text-center text-gray-text py-8">No products yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}