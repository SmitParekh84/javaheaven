'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { createClient } from '@/lib/supabase';

const COUNTRY_CODES = [
  { name: 'India', code: '+91' },
  { name: 'United States', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Canada', code: '+1' },
  { name: 'Australia', code: '+61' },
  { name: 'Germany', code: '+49' },
  { name: 'France', code: '+33' },
  { name: 'Japan', code: '+81' },
  { name: 'Brazil', code: '+55' },
  { name: 'South Africa', code: '+27' },
];

interface FormData {
  username: string;
  mobno: string;
  email: string;
  password: string;
  confirmPassword: string;
  countryCode: string;
}

interface FormErrors {
  username?: string;
  mobno?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    username: '',
    mobno: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'mobno') {
      const digits = value.replace(/\D/g, '');
      const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 10)}` : digits;
      setForm(f => ({ ...f, mobno: formatted }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    setErrors(err => ({ ...err, [name]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const mobile = `${form.countryCode}-${form.mobno.replace(/-/g, '')}`;

    if (form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!/^\+\d{1,3}-\d{10}$/.test(mobile)) errs.mobno = 'Enter a valid 10-digit mobile number';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();
    const mobile   = `${form.countryCode}-${form.mobno.replace(/-/g, '')}`;

    const { error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          name:  form.username,
          phone: mobile,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Account created! Check your email to confirm your address.');
    router.push('/login');
  };

  const inputClass =
    'w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50';

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-10">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-brand-text mb-8">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-brand-muted mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="At least 3 characters"
              value={form.username}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.username && <p className="text-danger text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Country + Mobile */}
          <div className="flex gap-3">
            <div className="w-44 shrink-0">
              <label htmlFor="countryCode" className="block text-sm font-semibold text-brand-muted mb-1">
                Country
              </label>
              <select
                id="countryCode"
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                className={inputClass}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.name + c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="mobno" className="block text-sm font-semibold text-brand-muted mb-1">
                Mobile
              </label>
              <input
                id="mobno"
                name="mobno"
                type="tel"
                required
                placeholder="10-digit number"
                value={form.mobno}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.mobno && <p className="text-danger text-xs mt-1">{errors.mobno}</p>}
            </div>
          </div>

          {/* Email */}
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
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-brand-muted mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-brand-muted hover:text-brand-text"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-brand-muted mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-9 text-brand-muted hover:text-brand-text"
            >
              {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
            {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-secondary text-brand-btn-text py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-secondary font-semibold hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Need assistance?{' '}
          <Link href="/get-help" className="text-brand-secondary font-semibold hover:underline">
            Get Help
          </Link>
        </p>
      </div>
    </div>
  );
}
