'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function GetHelpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 1) {
        const res = await fetch(`${API_URL}/api/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('OTP sent to your email');
          setStep(2);
        } else {
          toast.error(data.message || 'Failed to send OTP. Please try again.');
        }
      } else {
        const res = await fetch(`${API_URL}/api/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp, newPassword }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Password reset successfully');
          router.push('/login');
        } else {
          toast.error(data.message || 'Failed to reset password. Please try again.');
        }
      }
    } catch {
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h1>
        <p className="text-brand-muted mb-8 text-sm">
          {step === 1
            ? 'Enter your registered email and we will send an OTP to reset your password.'
            : 'Enter the OTP sent to your email and choose a new password.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-brand-muted mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-brand-muted mb-1">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  placeholder="Enter the OTP from your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-brand-muted mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  placeholder="Choose a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-secondary text-brand-btn-text py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing…' : step === 1 ? 'Send OTP' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          {step === 1 ? (
            <>
              Remember your password?{' '}
              <Link href="/login" className="text-brand-secondary font-semibold hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="text-brand-secondary font-semibold hover:underline"
            >
              ← Back
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
