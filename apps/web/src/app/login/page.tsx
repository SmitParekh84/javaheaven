'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useUser } from '@/components/providers/UserContext';
import { useCart } from '@/components/providers/CartContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const { setCartItems } = useCart();

  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || 'Login failed. Please try again.');
        return;
      }

      if (data.conflict) {
        setShowConflictModal(true);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', data.token);
      localStorage.setItem('userInfo', data.token);
      sessionStorage.setItem('sessionId', data.sessionId);
      sessionStorage.setItem('userId', data.userId);

      setUser(data.user);

      const cartRes = await fetch(`${API_URL}/api/users/cart/${data.user._id}`);
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData?.cart) {
          setCartItems(cartData.cart);
          localStorage.setItem('carttoken', btoa(JSON.stringify({ cartItems: cartData.cart })));
        }
      }

      toast.success(data.msg ?? 'Login successful.');
      router.push('/');
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    try {
      const loginRes = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const loginData = await loginRes.json();
      if (!loginData.userId) {
        toast.error('User ID not found. Please try again.');
        return;
      }
      const res = await fetch(`${API_URL}/api/logout-other-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loginData.userId }),
      });
      const data = await res.json();
      if (data.success) {
        setShowConflictModal(false);
        toast.success('Logged out from other sessions. Please log in again.');
      } else {
        toast.error('Failed to log out other sessions.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-brand-text mb-8">Welcome back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-brand-muted mb-1">
              Email or Mobile
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              placeholder="Email or mobile number"
              value={credentials.identifier}
              onChange={handleChange}
              className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-brand-muted mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Your password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 pr-11 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-brand-muted hover:text-brand-text"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-sm text-brand-muted">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-brand-secondary font-semibold hover:underline">
              Sign Up
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-secondary text-brand-btn-text py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-brand-muted">
          Trouble logging in?{' '}
          <Link href="/get-help" className="text-brand-secondary font-semibold hover:underline">
            Get Help
          </Link>
        </p>
      </div>

      {showConflictModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-3 text-gray-900">Session Conflict</h2>
            <p className="text-gray-600 mb-6 text-sm">
              You&apos;re already logged in from another device. Log out that session and continue here?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLogoutOtherSessions}
                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-full font-semibold hover:bg-red-600 transition-colors text-sm"
              >
                Log Out Other Session
              </button>
              <button
                onClick={() => { setShowConflictModal(false); toast('Login cancelled.'); }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm"
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
