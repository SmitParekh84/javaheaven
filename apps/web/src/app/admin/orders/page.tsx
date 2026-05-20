'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

type OrderStatus = 'Pending' | 'Delivered' | 'Cancelled';
type Tab = 'all' | 'pending' | 'delivered' | 'cancelled';

interface OrderItem { productId: string; name: string; size: string; price: number; quantity: number; subtotal: number; }
interface Order {
  _id: string; userId: string; status: OrderStatus;
  totalAmount: number; deliveryOption: string; address?: string;
  createdAt: string; items: OrderItem[];
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Delivered: 'text-green-600 font-semibold',
  Pending:   'text-yellow-600 font-semibold',
  Cancelled: 'text-red-500 font-semibold',
};

const ILLEGAL: Record<OrderStatus, OrderStatus[]> = {
  Delivered: ['Pending', 'Cancelled'],
  Cancelled: ['Pending', 'Delivered'],
  Pending:   [],
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!user || user.role !== 'admin') { router.push('/admin/login'); return; }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/orders`);
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch { toast.error('Failed to load orders.'); }
      finally { setLoading(false); }
    })();
  }, [router, refreshKey]);

  const handleStatusChange = async (orderId: string, current: OrderStatus, next: string) => {
    if (ILLEGAL[current]?.includes(next as OrderStatus)) {
      toast.error(`Cannot change from "${current}" to "${next}".`);
      return;
    }
    try {
      await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: next as OrderStatus } : o));
      toast.success(`Status updated to "${next}".`);
    } catch { toast.error('Failed to update status.'); }
  };

  const filtered = orders
    .filter(o => {
      if (tab === 'pending') return o.status === 'Pending';
      if (tab === 'delivered') return o.status === 'Delivered';
      if (tab === 'cancelled') return o.status === 'Cancelled';
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'pending', label: 'Pending' },
    { id: 'delivered', label: 'Delivered' }, { id: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-brand-text">Orders</h1>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-2 bg-brand-secondary text-brand-btn-text px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-brand-secondary text-brand-btn-text' : 'bg-brand-card text-brand-muted hover:bg-brand-accent'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({orders.filter(o => t.id === 'all' || o.status.toLowerCase() === t.id).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-brand-muted py-20">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order._id} className="bg-brand-card rounded-2xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <p className="font-bold text-brand-text text-lg">{order.userId}</p>
                  <p className="text-xs text-brand-muted font-mono">{order._id}</p>
                  <p className="text-sm text-brand-muted">
                    Status: <span className={STATUS_STYLES[order.status] ?? ''}>{order.status}</span>
                  </p>
                  <p className="text-sm text-brand-muted">Total: <span className="font-semibold text-brand-text">₹{order.totalAmount}</span></p>
                  <p className="text-sm text-brand-muted">
                    Delivery: <span className="font-semibold capitalize">{order.deliveryOption}</span>
                    {order.deliveryOption === 'home' && order.address && (
                      <span className="ml-1">— {order.address}</span>
                    )}
                  </p>
                  <p className="text-xs text-brand-muted">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="md:self-start">
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order._id, order.status, e.target.value)}
                    className="border border-brand-muted/30 rounded-lg px-3 py-2 bg-brand-bg text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-brand-muted/10 pt-4">
                <p className="text-xs font-semibold text-brand-muted uppercase mb-2">Items</p>
                <ul className="space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="text-sm text-brand-muted">
                      {item.name} ({item.size}) — ₹{item.price} × {item.quantity} = <span className="font-semibold text-brand-text">₹{item.subtotal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
