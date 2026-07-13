import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Package, ShoppingCart, AlertTriangle, BarChart2, Lock, Tag, Settings, Boxes,
  TrendingUp, Layers, Megaphone, Cog,
} from 'lucide-react';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminProducts from '@/components/admin/AdminProducts.jsx';
import AdminInventory from '@/components/admin/AdminInventory';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminReports from '@/components/admin/AdminReports';
import AdminDiscountCodes from '@/components/admin/AdminDiscountCodes';
import AdminBundles from '@/components/admin/AdminBundles';
import AdminSettings from '@/components/admin/AdminSettings';

const GROUPS = [
  {
    key: 'sales',
    label: 'Sales & Orders',
    icon: TrendingUp,
    items: [
      { key: 'overview', label: 'Overview', icon: Package },
      { key: 'orders', label: 'Orders', icon: ShoppingCart },
      { key: 'reports', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    key: 'catalog',
    label: 'Catalog',
    icon: Layers,
    items: [
      { key: 'products', label: 'Products', icon: Package },
      { key: 'inventory', label: 'Inventory', icon: AlertTriangle },
      { key: 'bundles', label: 'Bundles', icon: Boxes },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    items: [
      { key: 'discounts', label: 'Rabattcodes', icon: Tag },
    ],
  },
  {
    key: 'system',
    label: 'System',
    icon: Cog,
    items: [
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Dashboard() {
  const [group, setGroup] = useState('sales');
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

  // Switch group + auto-select first sub-tab of that group
  const handleGroupChange = (nextGroup) => {
    setGroup(nextGroup);
    const g = GROUPS.find(x => x.key === nextGroup);
    if (g && !g.items.some(i => i.key === tab)) {
      setTab(g.items[0].key);
    }
  };

  // Jump to a sub-tab from anywhere (e.g., low-stock alert)
  const jumpTo = (subKey) => {
    const parent = GROUPS.find(g => g.items.some(i => i.key === subKey));
    if (parent) setGroup(parent.key);
    setTab(subKey);
  };

  const activeGroup = GROUPS.find(g => g.key === group) || GROUPS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl tracking-[0.05em]">Admin Dashboard</h1>
        {lowStockItems.length > 0 && (
          <button
            onClick={() => jumpTo('inventory')}
            className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 text-xs tracking-wider hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            {lowStockItems.length} low stock alert{lowStockItems.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Group navigation (top-level) */}
      <Tabs value={group} onValueChange={handleGroupChange}>
        <TabsList className="bg-muted mb-4 flex-wrap h-auto gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {GROUPS.map(g => {
            const Icon = g.icon;
            return (
              <TabsTrigger key={g.key} value={g.key} className="gap-2">
                <Icon className="w-4 h-4" /> {g.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Sub-tabs within active group */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none mb-8 flex-wrap h-auto gap-1 overflow-x-auto no-scrollbar">
          {activeGroup.items.map(item => {
            const Icon = item.icon;
            const isInventoryAlert = item.key === 'inventory' && lowStockItems.length > 0;
            return (
              <TabsTrigger key={item.key} value={item.key} className="gap-2">
                <Icon className="w-4 h-4" /> {item.label}
                {isInventoryAlert && (
                  <span className="ml-1 bg-amber-400 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {lowStockItems.length}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
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
        <TabsContent value="discounts">
          <AdminDiscountCodes />
        </TabsContent>
        <TabsContent value="bundles">
          <AdminBundles />
        </TabsContent>
        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}