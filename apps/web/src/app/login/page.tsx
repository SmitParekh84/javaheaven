'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email:    credentials.email,
      password: credentials.password,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Login successful.');
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-brand-text mb-8">Welcome back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-muted mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={credentials.email}
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
              {showPassword
                ? <EyeSlashIcon className="w-5 h-5" />
                : <EyeIcon className="w-5 h-5" />}
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
    </div>
  );
}
