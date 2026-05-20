import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import './globals.css';
import { getTenantByDomain, buildCSSVars, cssVarsToString } from '@/lib/tenant';
import { DEFAULT_TENANT } from '@/types/tenant';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/providers/Providers';

export async function generateMetadata(): Promise<Metadata> {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const tenant = await getTenantByDomain(domain);
  return {
    title: {
      default: `${tenant.brandName} — Best Coffee Shop`,
      template: `%s | ${tenant.brandName}`,
    },
    description: `Experience the best coffee at ${tenant.brandName}. Freshly brewed coffee, artisan pastries, and a cozy atmosphere.`,
    icons: { icon: tenant.assets.faviconUrl },
    openGraph: {
      siteName: tenant.brandName,
      images: [tenant.assets.heroImage],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const tenant = await getTenantByDomain(domain);
  const cssVars = buildCSSVars(tenant);
  const inlineStyle = cssVarsToString(cssVars);
  const fontName = encodeURIComponent(tenant.theme.fontFamily);

  return (
    <html lang="en">
      <head>
        <link
          href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600;700&display=swap`}
          rel="stylesheet"
        />
        {/* Inject per-tenant CSS variables */}
        <style dangerouslySetInnerHTML={{ __html: inlineStyle }} />
        {/* Razorpay checkout */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body>
        <Providers tenant={tenant}>
          <div className="flex flex-col min-h-screen font-brand">
            <Navbar tenant={tenant} />
            <main className="flex-grow">{children}</main>
            <Footer tenant={tenant} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
