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
type Period = 'monthly' | 'daily' | 'yearly';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

export default function RevenuePage() {
  const router = useRouter();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [period, setPeriod] = useState<Period>('monthly');
  const [barData, setBarData] = useState<any>(null);
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dashboard`);
      const json = await res.json();
      if (json.status !== 'success') { setError('Failed to load revenue data.'); return; }
      const d = json.data;
      setTotalRevenue(d.totalSales ?? 0);

      let labels: string[] = [];
      let values: number[] = [];
      if (p === 'monthly' && d.monthlyData) { labels = d.monthlyData.map((x: any) => x.month); values = d.monthlyData.map((x: any) => x.totalSales); }
      if (p === 'daily'   && d.dailyData)   { labels = d.dailyData.map((x: any) => x._id);    values = d.dailyData.map((x: any) => x.totalSales); }
      if (p === 'yearly'  && d.yearlyData)  { labels = d.yearlyData.map((x: any) => x._id);   values = d.yearlyData.map((x: any) => x.totalSales); }

      setBarData({
        labels,
        datasets: [{ label: 'Revenue (₹)', data: values, backgroundColor: 'rgba(75,192,192,0.8)', borderRadius: 4 }],
      });

      const dOpts = d.deliveryOptionData ?? [];
      setDeliveryData({
        labels: dOpts.map((x: any) => x.deliveryOption),
        datasets: [{
          label: 'Sales by delivery',
          data: dOpts.map((x: any) => x.totalSales),
          backgroundColor: ['rgba(255,99,132,0.7)', 'rgba(54,162,235,0.7)'],
        }],
      });
    } catch { setError('Failed to load revenue data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!user || user.role !== 'admin') { router.push('/admin/login'); return; }
    fetchData(period);
  }, [router, period]);

  const homeRevenue = deliveryData?.labels?.includes('home')
    ? deliveryData.datasets[0].data[deliveryData.labels.indexOf('home')] ?? 0 : 0;
  const handRevenue = deliveryData?.labels?.includes('hand')
    ? deliveryData.datasets[0].data[deliveryData.labels.indexOf('hand')] ?? 0 : 0;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-danger">{error}</p>
      <button onClick={() => fetchData(period)} className="bg-brand-secondary text-brand-btn-text px-6 py-2 rounded-full font-semibold hover:opacity-90">Retry</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand-text mb-2">Revenue</h1>
      <p className="text-brand-muted mb-8">Total revenue: <span className="text-2xl font-bold text-success ml-1">₹{totalRevenue}</span></p>

      {/* Delivery split cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-blue-50 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-600 mb-1">Home Delivery Revenue</p>
          <p className="text-3xl font-bold text-blue-700">₹{homeRevenue}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-green-600 mb-1">Takeaway Revenue</p>
          <p className="text-3xl font-bold text-green-700">₹{handRevenue}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-brand-card rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-text">Revenue Over Time</h2>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="border border-brand-muted/30 rounded-lg px-3 py-2 bg-brand-bg text-brand-text text-sm focus:outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        {barData && <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />}
      </div>

      {/* Pie chart */}
      {deliveryData && (
        <div className="bg-brand-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Sales by Delivery Option</h2>
          <div className="h-72 max-w-sm mx-auto">
            <Pie data={deliveryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      )}
    </div>
  );
}
