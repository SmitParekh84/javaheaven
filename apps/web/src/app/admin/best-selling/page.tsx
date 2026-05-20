'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Pie = dynamic(() => import('react-chartjs-2').then(m => m.Pie), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

interface BestSeller { name: string; totalSold: number; }

const PIE_COLORS = [
  'rgba(255,99,132,0.7)', 'rgba(54,162,235,0.7)', 'rgba(255,206,86,0.7)',
  'rgba(75,192,192,0.7)', 'rgba(153,102,255,0.7)',
];

export default function BestSellingPage() {
  const router = useRouter();
  const [items, setItems] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!user || user.role !== 'admin') { router.push('/admin/login'); return; }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        const json = await res.json();
        setItems(json.data?.bestSellingItems ?? []);
      } catch { setError('Failed to load data.'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-danger">{error}</div>;

  const pieData = {
    labels: items.map(i => i.name),
    datasets: [{ label: 'Units sold', data: items.map(i => i.totalSold), backgroundColor: PIE_COLORS }],
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand-text mb-8">Best Selling Items</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List */}
        <div className="bg-brand-card rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Rankings</h2>
          {items.length === 0 ? (
            <p className="text-brand-muted text-sm">No sales data yet.</p>
          ) : (
            <ol className="space-y-3">
              {items.map((item, idx) => (
                <li key={item.name} className="flex items-center justify-between bg-brand-accent rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-secondary text-brand-btn-text text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-brand-text">{item.name}</span>
                  </div>
                  <span className="text-brand-secondary font-bold">{item.totalSold} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Pie */}
        {items.length > 0 && (
          <div className="bg-brand-card rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-brand-text mb-4">Distribution</h2>
            <div className="h-72">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
