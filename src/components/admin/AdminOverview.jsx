import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminOverview({ orders, products }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const totalItems = products.reduce((sum, p) =>
    sum + (p.stock || []).reduce((s, st) => s + st.quantity, 0), 0);

  const stats = [
    { title: 'Total Revenue', value: `€${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600' },
    { title: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600' },
    { title: 'Pending Orders', value: pendingOrders.length, icon: TrendingUp, color: 'text-amber-600' },
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm tracking-wider uppercase">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 10).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{order.order_number}</p>
                  <p className="text-xs text-gray-text">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">€{order.total?.toFixed(2)}</p>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{order.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-gray-text">No orders yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}