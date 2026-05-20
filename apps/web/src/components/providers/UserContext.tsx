'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface UserContextValue {
  user:    Record<string, unknown> | null;
  setUser: (u: Record<string, unknown> | null) => void;
}

const UserContext = createContext<UserContextValue>({ user: null, setUser: () => {} });

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.setItem('user', token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserState(payload);
      } catch {}
    }
  }, []);

  const setUser = (u: Record<string, unknown> | null) => {
    setUserState(u);
    if (!u) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
