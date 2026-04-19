import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Package, ShoppingCart, AlertTriangle, Users } from 'lucide-react';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminInventory from '@/components/admin/AdminInventory';
import AdminOverview from '@/components/admin/AdminOverview';

export default function Dashboard() {
  const [tab, setTab] = useState('overview');

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const lowStockItems = products.flatMap(p =>
    (p.stock || []).filter(s => s.quantity <= (p.low_stock_threshold || 3) && s.quantity > 0)
      .map(s => ({ product: p.name, color: s.color, size: s.size, quantity: s.quantity }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl">Admin Dashboard</h1>
        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {lowStockItems.length} low stock alerts
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted mb-8">
          <TabsTrigger value="overview" className="gap-2"><Package className="w-4 h-4" />Overview</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><ShoppingCart className="w-4 h-4" />Orders</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package className="w-4 h-4" />Products</TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2"><AlertTriangle className="w-4 h-4" />Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverview orders={orders} products={products} />
        </TabsContent>
        <TabsContent value="orders">
          <AdminOrders orders={orders} />
        </TabsContent>
        <TabsContent value="products">
          <AdminProducts products={products} />
        </TabsContent>
        <TabsContent value="inventory">
          <AdminInventory products={products} lowStockItems={lowStockItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}