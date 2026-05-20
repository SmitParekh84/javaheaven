import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/',                priority: 1.0, changeFrequency: 'daily' },
  { path: '/menu',            priority: 0.9, changeFrequency: 'daily' },
  { path: '/about',           priority: 0.7, changeFrequency: 'monthly' },
  { path: '/leadership-team', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/get-help',        priority: 0.4, changeFrequency: 'monthly' },
  { path: '/login',           priority: 0.3, changeFrequency: 'yearly' },
  { path: '/sign-up',         priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${domain}`;
  const now = new Date();

  let items: { _id: string }[] = [];
  try {
    const res = await fetch(`${API_URL}/api/items`, { next: { revalidate: 3600 } });
    if (res.ok) items = await res.json();
  } catch { /* skip if API unavailable at build time */ }

  return [
    ...STATIC_ROUTES.map(r => ({
      url: `${baseUrl}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...items.map(item => ({
      url: `${baseUrl}/item/${item._id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
