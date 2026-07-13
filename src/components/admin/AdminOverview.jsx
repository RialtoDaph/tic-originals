import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminOverview({ orders, products }) {
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o =>
    o.payment_status === 'paid' &&
    (o.status === 'confirmed' || o.status === 'processing')
  );
  const totalItems = products.reduce((sum, p) =>
    sum + (p.stock || []).reduce((s, st) => s + st.quantity, 0), 0);

  const stats = [
    { title: 'Total Revenue', value: `€${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600' },
    { title: 'Paid Orders', value: paidOrders.length, icon: ShoppingCart, color: 'text-blue-600' },
    { title: 'To Fulfill', value: pendingOrders.length, icon: TrendingUp, color: 'text-amber-600' },
    { title: 'Total Stock', value: totalItems, icon: Package, color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs tracking-wider uppercase text-gray-text">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}