import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, Trash2, Eye, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import OrderDetailModal from './OrderDetailModal';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function AdminOrders({ orders }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const queryClient = useQueryClient();
  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId, status) => {
    await base44.entities.Order.update(orderId, { status });
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  const updateTracking = async (orderId, carrier, trackingNumber) => {
    await base44.entities.Order.update(orderId, { shipping_carrier: carrier, tracking_number: trackingNumber });
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  const deleteOrder = async (orderId) => {
    await base44.entities.Order.delete(orderId);
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Total', 'Status', 'Payment', 'Tracking'];
    const rows = filtered.map(o => [
      o.order_number, o.created_date, o.customer_name, o.customer_email,
      o.total?.toFixed(2), o.status, o.payment_status, o.tracking_number || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-sm tracking-wider uppercase">Orders ({filtered.length})</CardTitle>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-text" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-full sm:w-48" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV} className="shrink-0"><Download className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">CSV</span></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile — tap-friendly cards */}
        <div className="md:hidden space-y-2">
          {filtered.map(order => (
            <button
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className="w-full text-left border rounded-lg p-4 hover:bg-muted/50 active:bg-muted transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{order.order_number}</p>
                  <p className="text-sm font-medium shrink-0">€{order.total?.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-text truncate">{order.customer_name || order.customer_email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-muted rounded-full">
                    {order.status}
                  </span>
                  <span className="text-[10px] text-gray-text">
                    {order.created_date ? format(new Date(order.created_date), 'dd.MM.yy') : '-'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-text shrink-0" />
            </button>
          ))}
        </div>

        {/* Desktop — table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 text-xs tracking-wider uppercase text-gray-text">Order</th>
                <th className="pb-3 text-xs tracking-wider uppercase text-gray-text">Date</th>
                <th className="pb-3 text-xs tracking-wider uppercase text-gray-text">Customer</th>
                <th className="pb-3 text-xs tracking-wider uppercase text-gray-text">Total</th>
                <th className="pb-3 text-xs tracking-wider uppercase text-gray-text">Status</th>
                <th className="pb-3 text-xs tracking-wider uppercase text-gray-text">Tracking</th>
                <th className="pb-3 text-xs tracking-wider uppercase text-gray-text"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="hover:text-cyan-dark hover:underline text-left"
                    >
                      {order.order_number}
                    </button>
                  </td>
                  <td className="py-3 text-gray-text">{order.created_date ? format(new Date(order.created_date), 'dd.MM.yy') : '-'}</td>
                  <td className="py-3">
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-gray-text">{order.customer_email}</p>
                  </td>
                  <td className="py-3">€{order.total?.toFixed(2)}</td>
                  <td className="py-3">
                    <Select value={order.status} onValueChange={v => updateStatus(order.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3">
                    <Input
                      placeholder="Tracking #"
                      defaultValue={order.tracking_number || ''}
                      className="w-36 h-8 text-xs"
                      onBlur={e => {
                        if (e.target.value !== (order.tracking_number || '')) {
                          updateTracking(order.id, 'DHL', e.target.value);
                        }
                      }}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-text hover:text-dark"
                        onClick={() => setSelectedOrderId(order.id)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-text hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete order {order.order_number}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes the order from the database. Stock will not be restored automatically. Only use for abandoned/unpaid pending orders.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOrder(order.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-text py-8">No orders found</p>}
      </CardContent>
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(v) => !v && setSelectedOrderId(null)}
      />
    </Card>
  );
}