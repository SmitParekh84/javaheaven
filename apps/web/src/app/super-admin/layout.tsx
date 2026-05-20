import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin — Tenant Management',
  robots: { index: false, follow: false },
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
