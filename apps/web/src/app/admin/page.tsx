'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/admin/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'admin') router.replace('/admin/dashboard');
      else router.replace('/admin/login');
    } catch {
      router.replace('/admin/login');
    }
  }, [router]);

  return null;
}
