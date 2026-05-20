'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Bar = dynamic(() => import('react-chartjs-2').then(m => m.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then(m => m.Pie), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

interface BestSeller { name: string; totalSold: number; }

interface DashData {
  totalOrders: number;
  totalDeliveredOrders: number;
  totalPendingOrders: number;
  totalItemsOrders: number;
  recentOrders: unknown[];
  totalUsers: number;
  totalSales: number;
  bestSellingItems: BestSeller[];
  monthlyData: { month: string; totalOrders: number; totalSales: number }[];
}

const PIE_COLORS = [
  'rgba(255,99,132,0.7)', 'rgba(54,162,235,0.7)', 'rgba(255,206,86,0.7)',
  'rgba(75,192,192,0.7)', 'rgba(153,102,255,0.7)',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/dashboard`);
      const json = await res.json();
      if (json.status === 'success') setData(json.data);
      else setError('Failed to load dashboard data.');
    } catch { setError('Failed to load dashboard data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!user || user.role !== 'admin') { router.push('/admin/login'); return; }
    fetchData();
  }, [router]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-danger">{error}</p>
      <button onClick={fetchData} className="bg-brand-secondary text-brand-btn-text px-6 py-2 rounded-full font-semibold hover:opacity-90">Retry</button>
    </div>
  );

  if (!data) return null;

  const statCards = [
    { label: 'Total Orders',        value: data.totalOrders,           color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Delivered',           value: data.totalDeliveredOrders,  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Pending',             value: data.totalPendingOrders,    color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Sales',         value: `₹${data.totalSales}`,      color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Users',         value: data.totalUsers,            color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Items Ordered',       value: data.totalItemsOrders,      color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Recent (7 days)',     value: data.recentOrders.length,   color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const barData = {
    labels: data.monthlyData.map(m => m.month),
    datasets: [
      { label: 'Total Orders', data: data.monthlyData.map(m => m.totalOrders), backgroundColor: 'rgba(75,192,192,0.8)' },
      { label: 'Total Sales',  data: data.monthlyData.map(m => m.totalSales),  backgroundColor: 'rgba(255,159,64,0.8)' },
    ],
  };

  const pieData = {
    labels: data.bestSellingItems.map(i => i.name),
    datasets: [{ label: 'Units sold', data: data.bestSellingItems.map(i => i.totalSold), backgroundColor: PIE_COLORS }],
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand-text mb-8">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-sm`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}

        {/* Best sellers inline card */}
        <div className="bg-blue-50 rounded-2xl p-5 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Items</p>
          <ul className="space-y-1">
            {data.bestSellingItems.slice(0, 3).map(i => (
              <li key={i.name} className="text-sm text-gray-700">
                <span className="font-semibold">{i.name}</span> — {i.totalSold} sold
              </li>
            ))}
            {data.bestSellingItems.length === 0 && <li className="text-sm text-gray-500">No data yet.</li>}
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Monthly Overview</h2>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>

        <div className="bg-brand-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Best Sellers Distribution</h2>
          <div className="h-72">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
