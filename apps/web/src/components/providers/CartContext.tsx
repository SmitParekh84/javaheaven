'use client';

import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import { createClient } from '@/lib/supabase';

export interface CartItem {
  id:        string;
  name:      string;
  price:     number;
  quantity:  number;
  size:      string;
  imageUrl?: string;
}

interface CartContextValue {
  cartItems:              CartItem[];
  setCartItems:           (items: CartItem[]) => void;
  addToCart:              (item: CartItem) => void;
  removeFromCart:         (id: string, size: string) => void;
  updateCartItemQuantity: (id: string, size: string, qty: number) => void;
  clearCart:              () => void;
  totalItems:             number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function encodeCart(items: CartItem[]) {
  return btoa(JSON.stringify({ cartItems: items }));
}

function decodeCart(token: string): CartItem[] {
  try {
    return JSON.parse(atob(token)).cartItems ?? [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const isMounted = useRef(false);
  const [cartItems, setCartItemsState] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('carttoken');
    return saved ? decodeCart(saved) : [];
  });

  const setCartItems = useCallback((items: CartItem[]) => {
    setCartItemsState(items);
  }, []);

  // Persist to localStorage + sync to Express backend on every cart change
  useEffect(() => {
    localStorage.setItem('carttoken', encodeCart(cartItems));
    if (!isMounted.current) { isMounted.current = true; return; }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tenantId: 'default',
          items: cartItems.map((i) => ({
            menuItemId: i.id,
            name:       i.name,
            price:      i.price,
            qty:        i.quantity,
            size:       i.size,
            imageUrl:   i.imageUrl,
          })),
        }),
      }).catch(() => {});
    });
  }, [cartItems]);

  // Hydrate cart from Express backend when user is logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data?.items) && data.items.length > 0) {
            setCartItemsState(
              data.items.map((i: {
                menuItemId: string; name: string; price: number; qty: number; size: string; imageUrl?: string;
              }) => ({
                id:       i.menuItemId,
                name:     i.name,
                price:    i.price,
                quantity: i.qty,
                size:     i.size,
                imageUrl: i.imageUrl,
              }))
            );
          }
        })
        .catch(() => {});
    });
  }, []);

  const addToCart = useCallback((newItem: CartItem) => {
    setCartItemsState((prev) => {
      const idx = prev.findIndex((i) => i.id === newItem.id && i.size === newItem.size);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + (newItem.quantity || 1) };
        return updated;
      }
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string, size: string) => {
    setCartItemsState((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
  }, []);

  const updateCartItemQuantity = useCallback((id: string, size: string, qty: number) => {
    setCartItemsState((prev) =>
      prev.map((i) => i.id === id && i.size === size ? { ...i, quantity: Math.max(qty, 1) } : i)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItemsState([]);
    localStorage.removeItem('carttoken');
  }, []);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, setCartItems, addToCart, removeFromCart,
      updateCartItemQuantity, clearCart, totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
}
