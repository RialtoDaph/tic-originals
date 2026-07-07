import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, ShoppingBag, Euro } from 'lucide-react';
import { format, subDays, isAfter, parseISO } from 'date-fns';

const RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: null },
];

export default function AdminReports({ orders }) {
  const [range, setRange] = useState('30');

  const filtered = useMemo(() => {
    const days = range === 'null' ? null : parseInt(range);
    if (!days) return orders;
    const cutoff = subDays(new Date(), days);
    return orders.filter(o => {
      try { return isAfter(parseISO(o.created_date), cutoff); } catch { return false; }
    });
  }, [orders, range]);

  // Revenue is only counted from PAID orders — pending/cancelled don't earn money
  const paidFiltered = useMemo(() => filtered.filter(o => o.payment_status === 'paid'), [filtered]);
  const revenue = paidFiltered.reduce((s, o) => s + (o.total || 0), 0);
  const vatTotal = paidFiltered.reduce((s, o) => s + (o.vat_amount || 0), 0);
  const avgOrder = paidFiltered.length ? revenue / paidFiltered.length : 0;

  // Revenue by product — only paid orders
  const productRevenue = useMemo(() => {
    const map = {};
    paidFiltered.forEach(o => {
      (o.items || []).forEach(item => {
        const key = item.product_name || 'Unknown';
        map[key] = (map[key] || 0) + (item.unit_price || 0) * (item.quantity || 1);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [paidFiltered]);

  // Revenue by status
  const byStatus = useMemo(() => {
    const map = {};
    filtered.forEach(o => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const exportCSV = () => {
    const headers = [
      'Order Number', 'Date', 'Customer', 'Email',
      'Subtotal', 'Shipping', 'VAT', 'Total',
      'Status', 'Payment Status', 'Shipping Method',
      'Items'
    ];
    const rows = filtered.map(o => [
      o.order_number || '',
      o.created_date ? format(parseISO(o.created_date), 'dd.MM.yyyy') : '',
      o.customer_name || '',
      o.customer_email || '',
      (o.subtotal || 0).toFixed(2),
      (o.shipping_cost || 0).toFixed(2),
      (o.vat_amount || 0).toFixed(2),
      (o.total || 0).toFixed(2),
      o.status || '',
      o.payment_status || '',
      o.shipping_method || '',
      (o.items || []).map(i => `${i.quantity}x ${i.product_name} (${i.color}/${i.size})`).join('; ')
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tic-sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-heading text-xl tracking-[0.05em]">Sales Report</h2>
        <div className="flex gap-3">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map(r => (
                <SelectItem key={String(r.days)} value={String(r.days)}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportCSV} className="bg-cyan text-dark-deep hover:bg-cyan-dark">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue (paid)', value: `€${revenue.toFixed(2)}`, icon: Euro, color: 'text-emerald-600' },
          { label: 'Orders (total)', value: filtered.length, icon: ShoppingBag, color: 'text-blue-600' },
          { label: 'Avg. Order Value', value: `€${avgOrder.toFixed(2)}`, icon: TrendingUp, color: 'text-violet-600' },
          { label: 'VAT Collected', value: `€${vatTotal.toFixed(2)}`, icon: Euro, color: 'text-amber-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs tracking-wider uppercase text-gray-text">{stat.label}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs tracking-wider uppercase text-gray-text">Revenue by Product</CardTitle>
          </CardHeader>
          <CardContent>
            {productRevenue.length === 0 ? (
              <p className="text-sm text-gray-text py-4">No sales data</p>
            ) : (
              <div className="space-y-3">
                {productRevenue.map(([name, rev]) => {
                  const pct = revenue > 0 ? (rev / revenue) * 100 : 0;
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium truncate">{name}</span>
                        <span className="ml-4 shrink-0">€{rev.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-cyan rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs tracking-wider uppercase text-gray-text">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.length === 0 ? (
              <p className="text-sm text-gray-text py-4">No orders in range</p>
            ) : (
              <div className="space-y-3">
                {byStatus.map(([status, count]) => {
                  const pct = filtered.length > 0 ? (count / filtered.length) * 100 : 0;
                  const colorMap = {
                    delivered: 'bg-emerald-500', shipped: 'bg-blue-500',
                    processing: 'bg-violet-500', confirmed: 'bg-cyan',
                    pending: 'bg-amber-400', cancelled: 'bg-red-400', returned: 'bg-gray-400'
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium">{status}</span>
                        <span>{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colorMap[status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders Table for selected period */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs tracking-wider uppercase text-gray-text">
            Order Detail — {filtered.length} orders · €{revenue.toFixed(2)} total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  {['Order', 'Date', 'Customer', 'Items', 'Shipping', 'Total', 'Status'].map(h => (
                    <th key={h} className="pb-3 text-xs tracking-wider uppercase text-gray-text pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{o.order_number}</td>
                    <td className="py-2 pr-4 text-gray-text whitespace-nowrap">
                      {o.created_date ? format(parseISO(o.created_date), 'dd.MM.yy') : '-'}
                    </td>
                    <td className="py-2 pr-4">{o.customer_name}</td>
                    <td className="py-2 pr-4 text-gray-text">
                      {(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-2 pr-4">€{(o.shipping_cost || 0).toFixed(2)}</td>
                    <td className="py-2 pr-4 font-medium">€{(o.total || 0).toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                        o.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-muted text-gray-text'
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-text py-8">No orders in selected period</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}