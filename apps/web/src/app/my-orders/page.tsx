'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

type OrderStatus = 'Pending' | 'Delivered' | 'Cancelled';
type Tab = 'all' | 'pending' | 'delivered' | 'cancelled';

interface OrderItem {
  _id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface MenuItem { name: string; imageUrl: string; }

const STATUS_STYLES: Record<OrderStatus, string> = {
  Delivered: 'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-600',
  Pending:    'bg-yellow-100 text-yellow-700',
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const usernameRef = useRef('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const user = parseJwt(token);
    if (!user?.username) { router.push('/login'); return; }
    usernameRef.current = user.username;

    const fetchAll = async () => {
      try {
        const [ordersRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/api/orders/${user.username}`),
          fetch(`${API_URL}/api/items`),
        ]);
        if (ordersRes.ok) {
          const d = await ordersRes.json();
          setOrders(d.orders ?? []);
        } else {
          const d = await ordersRes.json();
          setError(d.msg || 'Failed to load orders.');
        }
        if (itemsRes.ok) setMenuItems(await itemsRes.json());
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${usernameRef.current}`);
        if (res.ok) {
          const d = await res.json();
          setOrders(prev => {
            const next = d.orders ?? [];
            return JSON.stringify(next) !== JSON.stringify(prev) ? next : prev;
          });
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const getImage = (name: string) =>
    menuItems.find(i => i.name.toLowerCase() === name.toLowerCase())?.imageUrl ?? '';

  const filtered = orders
    .filter(o => {
      if (tab === 'pending') return o.status === 'Pending';
      if (tab === 'delivered') return o.status === 'Delivered';
      if (tab === 'cancelled') return o.status === 'Cancelled';
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-brand-text mb-8">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-brand-secondary text-brand-btn-text'
                  : 'bg-brand-card text-brand-muted hover:bg-brand-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-brand-muted">
            <p className="text-lg mb-4">No orders found.</p>
            <Link
              href="/menu"
              className="inline-block bg-brand-secondary text-brand-btn-text px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(order => (
              <div
                key={order._id}
                className="bg-brand-card rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <div>
                    <p className="text-lg font-bold text-brand-text">₹{order.totalAmount}</p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {order.status}
                  </span>
                </div>

                <ul className="space-y-3">
                  {order.items.map(item => {
                    const img = getImage(item.name);
                    return (
                      <li key={item._id} className="flex items-center gap-4">
                        {img ? (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-brand-accent">
                            <Image src={img} alt={item.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-brand-accent shrink-0" />
                        )}
                        <div className="text-sm">
                          <p className="font-semibold text-brand-text">
                            {item.name}{' '}
                            <span className="font-normal text-brand-muted">({item.size})</span>
                          </p>
                          <p className="text-brand-muted">
                            ₹{item.price} × {item.quantity} ={' '}
                            <span className="font-semibold text-brand-text">₹{item.subtotal}</span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
