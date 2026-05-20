import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/super-admin/', '/api/'],
      },
    ],
    sitemap: `${protocol}://${domain}/sitemap.xml`,
  };
}
