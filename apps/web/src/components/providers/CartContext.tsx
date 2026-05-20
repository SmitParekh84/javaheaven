'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export interface CartItem {
  id:       string;
  _id?:     string;
  name:     string;
  price:    number;
  quantity: number;
  size:     string;
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

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

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

  // Sync to localStorage + server on change (skip initial mount)
  useEffect(() => {
    localStorage.setItem('carttoken', encodeCart(cartItems));
    if (!isMounted.current) { isMounted.current = true; return; }

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? parseJwt(storedUser) : null;
    if (!user?.userId) return;

    fetch(`${API_URL}/api/users/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, cartItems }),
    }).catch(() => {});
  }, [cartItems]);

  // Hydrate cart from server on mount (when logged in)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? parseJwt(storedUser) : null;
    if (!user?._id) return;
    fetch(`${API_URL}/api/users/cart/${user._id}`)
      .then(r => r.json())
      .then(data => { if (data?.cart) setCartItemsState(data.cart); })
      .catch(() => {});
  }, []);

  const addToCart = useCallback((newItem: CartItem) => {
    setCartItemsState(prev => {
      const idx = prev.findIndex(i => i.id === newItem.id && i.size === newItem.size);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + (newItem.quantity || 1) };
        return updated;
      }
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string, size: string) => {
    setCartItemsState(prev => prev.filter(i => !(i.id === id && i.size === size)));
  }, []);

  const updateCartItemQuantity = useCallback((id: string, size: string, qty: number) => {
    setCartItemsState(prev =>
      prev.map(i => i.id === id && i.size === size ? { ...i, quantity: Math.max(qty, 1) } : i)
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
