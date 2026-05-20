import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ItemDetailClient from '@/components/item/ItemDetailClient';
import { JsonLd } from '@/components/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function getItem(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/items/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getSimilar(category: string, excludeId: string) {
  try {
    const res = await fetch(`${API_URL}/api/items?category=${encodeURIComponent(category)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const all = await res.json();
    return Array.isArray(all) ? all.filter((i: any) => i._id !== excludeId) : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return { title: 'Item not found' };
  return {
    title: item.name,
    description: item.description ?? `Order ${item.name} — ₹${item.price}`,
    openGraph: { images: item.imageUrl ? [item.imageUrl] : [] },
  };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const similar = item.category ? await getSimilar(item.category, id) : [];

  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${domain}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description,
    ...(item.imageUrl ? { image: item.imageUrl } : {}),
    offers: {
      '@type': 'Offer',
      price: String(item.price),
      priceCurrency: 'INR',
      availability: (item.stock ?? 1) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/item/${id}`,
    },
  };

  return (
    <>
      <JsonLd data={schema} />
      <ItemDetailClient item={item} similar={similar} />
    </>
  );
}
