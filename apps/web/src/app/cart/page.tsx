'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@/components/providers/CartContext';
import { useUser } from '@/components/providers/UserContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function CartPage() {
  const router = useRouter();
  const { user } = useUser();
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'hand' | 'home'>('hand');
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleQuantity = (id: string, size: string, delta: number, current: number) => {
    const next = current + delta;
    if (next < 1) removeFromCart(id, size);
    else updateCartItemQuantity(id, size, next);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }

    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/payments/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tenantId: 'default' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? 'Failed to start checkout');
      }
    } catch {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-muted">Redirecting to payment…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-brand-text mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-brand-muted text-xl mb-6">Your cart is empty.</p>
            <Link
              href="/menu"
              className="bg-brand-secondary text-brand-btn-text px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-brand-card rounded-2xl p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {item.imageUrl && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-brand-text">{item.name}</h3>
                        <p className="text-sm text-brand-muted">Size: {item.size}</p>
                        <p className="text-sm text-brand-muted mt-0.5">₹{item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-danger/60 hover:text-danger text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantity(item.id, item.size, -1, item.quantity)}
                          className="w-8 h-8 rounded-full bg-brand-accent text-brand-text font-bold hover:bg-brand-muted/20 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-brand-text">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantity(item.id, item.size, 1, item.quantity)}
                          className="w-8 h-8 rounded-full bg-brand-accent text-brand-text font-bold hover:bg-brand-muted/20 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold text-brand-secondary">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary + Checkout */}
            <div className="space-y-4">
              <div className="bg-brand-card rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-brand-text mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-brand-muted">
                      <span>{item.name} ×{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-brand-muted/20 pt-3 flex justify-between font-bold text-brand-text">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="bg-brand-card rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-brand-text">Delivery</h2>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="hand"
                    checked={deliveryOption === 'hand'}
                    onChange={() => setDeliveryOption('hand')}
                    className="accent-brand-secondary"
                  />
                  <span className="text-brand-text">Hand to Hand</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="home"
                    checked={deliveryOption === 'home'}
                    onChange={() => setDeliveryOption('home')}
                    className="accent-brand-secondary"
                  />
                  <span className="text-brand-text">Home Delivery</span>
                </label>

                {deliveryOption === 'home' && (
                  <input
                    type="text"
                    required
                    placeholder="Delivery address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 placeholder:text-brand-muted/50"
                  />
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-secondary text-brand-btn-text py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  Proceed to Payment
                </button>

                <button
                  type="button"
                  onClick={() => { clearCart(); toast.success('Cart cleared.'); }}
                  className="w-full border border-brand-muted/30 text-brand-muted py-2.5 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors"
                >
                  Clear Cart
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
