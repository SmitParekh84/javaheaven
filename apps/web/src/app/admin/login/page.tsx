'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useUser } from '@/components/providers/UserContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCredentials(c => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.msg || 'Admin login failed.'); return; }
      if (data.conflict) { setShowConflictModal(true); return; }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', data.token);
      localStorage.setItem('userRole', data.admin?.role ?? 'admin');
      sessionStorage.setItem('sessionId', data.sessionId);
      sessionStorage.setItem('userId', data.userId);
      setUser(data.admin);

      toast.success(data.msg ?? 'Admin login successful.');
      router.push('/admin/dashboard');
    } catch {
      toast.error('Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOthers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const { userId } = await res.json();
      if (!userId) { toast.error('Could not retrieve user ID.'); return; }
      const r = await fetch(`${API_URL}/api/logout-other-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const d = await r.json();
      if (d.success) { setShowConflictModal(false); toast.success('Other sessions cleared.'); }
      else toast.error('Failed to clear other sessions.');
    } catch { toast.error('An error occurred.'); }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-brand-text mb-2">Admin Login</h1>
        <p className="text-center text-brand-muted text-sm mb-8">Staff access only</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-brand-muted mb-1">Username</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              placeholder="Admin username"
              value={credentials.identifier}
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

      {showConflictModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-3 text-gray-900">Session Conflict</h2>
            <p className="text-gray-600 mb-6 text-sm">You are already logged in from another device.</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogoutOthers}
                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-full font-semibold hover:bg-red-600 text-sm"
              >
                Log Out Other Session
              </button>
              <button
                onClick={() => { setShowConflictModal(false); toast('Cancelled.'); }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full font-semibold hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
