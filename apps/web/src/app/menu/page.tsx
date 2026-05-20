import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTenantByDomain } from '@/lib/tenant';
import MenuClient from '@/components/menu/MenuClient';
import { JsonLd } from '@/components/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function generateMetadata(): Promise<Metadata> {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const tenant = await getTenantByDomain(domain);
  return {
    title: `Menu — ${tenant.brandName}`,
    description: `Browse the full menu at ${tenant.brandName}. Coffees, teas, pastries and more.`,
  };
}

export default async function MenuPage() {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${domain}`;
  const tenant = await getTenantByDomain(domain);

  let items: { _id: string; name: string }[] = [];
  try {
    const res = await fetch(`${API_URL}/api/items`, { next: { revalidate: 3600 } });
    if (res.ok) items = await res.json();
  } catch { /* skip if API unavailable */ }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${tenant.brandName} Menu`,
    url: `${baseUrl}/menu`,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: `${baseUrl}/item/${item._id}`,
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <MenuClient tenant={tenant} />
    </>
  );
}
