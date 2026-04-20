import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Package, ShoppingCart, AlertTriangle, BarChart2, Lock } from 'lucide-react';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminInventory from '@/components/admin/AdminInventory';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminReports from '@/components/admin/AdminReports';

export default function Dashboard() {
  const [tab, setTab] = useState('overview');

  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
    enabled: currentUser?.role === 'admin',
  });

  const lowStockItems = products.flatMap(p =>
    (p.stock || []).filter(s => s.quantity > 0 && s.quantity <= (p.low_stock_threshold || 3))
      .map(s => ({ product: p.name, color: s.color, size: s.size, quantity: s.quantity }))
  );

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-heading text-xl tracking-[0.15em] animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h1 className="font-heading text-3xl">Access Denied</h1>
        <p className="text-gray-text text-sm max-w-sm">
          This area is restricted to administrators only. Please contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl tracking-[0.05em]">Admin Dashboard</h1>
        {lowStockItems.length > 0 && (
          <button
            onClick={() => setTab('inventory')}
            className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 text-xs tracking-wider hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            {lowStockItems.length} low stock alert{lowStockItems.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted mb-8 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <Package className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="w-4 h-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" /> Products
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Inventory
            {lowStockItems.length > 0 && (
              <span className="ml-1 bg-amber-400 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {lowStockItems.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart2 className="w-4 h-4" /> Reports
          </TabsTrigger>
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
        <TabsContent value="reports">
          <AdminReports orders={orders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}