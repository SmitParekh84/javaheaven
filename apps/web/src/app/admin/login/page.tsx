'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { createClient } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCredentials(c => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email:    credentials.email,
      password: credentials.password,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut();
      toast.error('Access denied. Admin accounts only.');
      return;
    }
    toast.success('Admin login successful.');
    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-brand-text mb-2">Admin Login</h1>
        <p className="text-center text-brand-muted text-sm mb-8">Staff access only</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-muted mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
              value={credentials.email}
              onChange={handleChange}
              className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-brand-muted mb-1">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 pr-11 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-brand-muted hover:text-brand-text"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-secondary text-brand-btn-text py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in…' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
