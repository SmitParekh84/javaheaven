import { headers } from 'next/headers';
import { getTenantByDomain } from '@/lib/tenant';
import HeroClient from '@/components/hero/HeroClient';
import { JsonLd } from '@/components/JsonLd';

export default async function HomePage() {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${domain}`;
  const tenant = await getTenantByDomain(domain);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: tenant.brandName,
    url: baseUrl,
    logo: tenant.assets.logoUrl.startsWith('/') ? `${baseUrl}${tenant.assets.logoUrl}` : tenant.assets.logoUrl,
    image: tenant.assets.heroImage.startsWith('/') ? `${baseUrl}${tenant.assets.heroImage}` : tenant.assets.heroImage,
    telephone: tenant.contact.phone,
    email: tenant.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: tenant.contact.address,
    },
    sameAs: [tenant.social.instagram, tenant.social.facebook, tenant.social.twitter, tenant.social.linkedin].filter(Boolean),
    servesCuisine: 'Coffee',
    hasMenu: `${baseUrl}/menu`,
    priceRange: '$$',
  };

  return (
    <>
      <JsonLd data={schema} />
      <HeroClient tenant={tenant} />
    </>
  );
}
