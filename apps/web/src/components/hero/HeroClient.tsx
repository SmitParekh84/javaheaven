'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Tenant } from '@/types/tenant';

export default function HeroClient({ tenant }: { tenant: Tenant }) {
  return (
    <div className="bg-brand-bg font-brand">
      {/* Demo banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 text-center py-3 px-4">
        <p className="text-sm font-semibold text-yellow-900">
          This is a demo — want a site like this?{' '}
          <a href={`mailto:${tenant.contact.email}`} className="underline hover:text-yellow-700">
            {tenant.contact.email}
          </a>
        </p>
      </div>

      {/* Hero section */}
      <section className="relative isolate overflow-hidden">
        {tenant.assets.heroImage && (
          <Image
            src={tenant.assets.heroImage}
            alt={`${tenant.brandName} hero`}
            fill
            className="object-cover -z-10 opacity-20"
            priority
          />
        )}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-brand-secondary leading-tight">
            {tenant.brandName}
          </h1>
          <p className="mt-4 text-xl text-brand-text/70 max-w-2xl mx-auto">
            Premium coffee, crafted for you. Every cup, a moment.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-brand-secondary text-brand-btn-text rounded-full px-8 py-3 font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              Explore Menu
            </Link>
            <Link
              href="/about"
              className="border-2 border-brand-secondary text-brand-secondary rounded-full px-8 py-3 font-semibold hover:bg-brand-accent transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Freshly Brewed', desc: 'Every order made fresh to order, never pre-made.' },
          { title: 'Premium Beans',  desc: 'Ethically sourced, single-origin beans from around the world.' },
          { title: 'Fast Delivery',  desc: 'Order online and get it delivered hot to your door.' },
        ].map(f => (
          <div key={f.title} className="bg-brand-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-brand-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-brand-secondary" />
            </div>
            <h3 className="font-bold text-lg text-brand-text mb-2">{f.title}</h3>
            <p className="text-brand-muted text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
