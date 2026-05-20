'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const sessionId    = searchParams.get('session_id');
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { router.push('/'); return; }
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      const res = await fetch(`${API_URL}/api/payments/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
      setLoading(false);
    });
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-brand-muted">Loading your order…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">☕</div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Order Confirmed!</h1>
        <p className="text-brand-muted mb-6">
          Your payment was successful. We&apos;re preparing your order.
        </p>
        {order && (
          <p className="text-brand-secondary font-semibold mb-4">
            Total: ${(order.total as number)?.toFixed(2)}
          </p>
        )}
        <Link
          href="/my-orders"
          className="block bg-brand-secondary text-brand-btn-text py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          View My Orders
        </Link>
        <Link
          href="/"
          className="block mt-3 text-brand-muted hover:text-brand-text text-sm transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
