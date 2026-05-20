'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

interface MenuItem { _id: string; name: string; imageUrl?: string; stock: number; }

export default function StockPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/items`);
      if (res.ok) setItems(await res.json());
    } catch { toast.error('Failed to fetch items.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!user || user.role !== 'admin') { router.push('/admin/login'); return; }
    fetchItems();
  }, [router]);

  const handleSave = async (id: string) => {
    const qty = Number(newStock);
    if (!qty || qty <= 0) { toast.error('Stock must be a positive number.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/stock/update-stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: qty }),
      });
      if (res.ok) {
        toast.success('Stock updated.');
        setEditId(null);
        setNewStock('');
        await fetchItems();
      } else {
        toast.error('Failed to update stock.');
      }
    } catch { toast.error('Failed to update stock.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand-text mb-8">Stock Management</h1>

      <div className="bg-brand-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-muted/20 text-left">
                <th className="px-6 py-4 font-semibold text-brand-muted">Image</th>
                <th className="px-6 py-4 font-semibold text-brand-muted">Item Name</th>
                <th className="px-6 py-4 font-semibold text-brand-muted">Stock</th>
                <th className="px-6 py-4 font-semibold text-brand-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/10">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-brand-accent/50 transition-colors">
                  <td className="px-6 py-4">
                    {item.imageUrl ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-accent">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-brand-accent" />
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-text">{item.name}</td>
                  <td className="px-6 py-4">
                    {editId === item._id ? (
                      <input
                        type="number"
                        min="1"
                        value={newStock}
                        onChange={e => setNewStock(e.target.value)}
                        className="w-24 border border-brand-muted/30 rounded-lg px-3 py-2 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
                        autoFocus
                      />
                    ) : (
                      <span className={`font-semibold ${item.stock <= 5 ? 'text-danger' : 'text-brand-text'}`}>
                        {item.stock}
                        {item.stock <= 5 && <span className="ml-1 text-xs">(low)</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editId === item._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(item._id)}
                          disabled={saving}
                          className="bg-success text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => { setEditId(null); setNewStock(''); }}
                          className="bg-brand-accent text-brand-muted px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-brand-muted/20"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditId(item._id); setNewStock(String(item.stock)); }}
                        className="bg-brand-secondary text-brand-btn-text px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
