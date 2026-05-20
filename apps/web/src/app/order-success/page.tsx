'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/components/providers/CartContext';

export default function OrderSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
        <CheckCircleIcon className="w-20 h-20 text-success mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-brand-text mb-3">Order Placed!</h1>
        <p className="text-brand-muted mb-8">
          Thank you for your order. We&apos;ll have it ready for you shortly.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/my-orders"
            className="bg-brand-secondary text-brand-btn-text py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            View My Orders
          </Link>
          <Link
            href="/menu"
            className="border border-brand-muted/30 text-brand-muted py-3 rounded-full font-semibold hover:bg-brand-accent transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
