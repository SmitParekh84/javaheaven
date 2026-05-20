'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMugHot, faSeedling, faBolt } from '@fortawesome/free-solid-svg-icons';
import { Tenant } from '@/types/tenant';

const FEATURES = [
  {
    icon: faMugHot,
    title: 'Freshly Brewed',
    desc: 'Every order made fresh to order, never pre-made.',
  },
  {
    icon: faSeedling,
    title: 'Premium Beans',
    desc: 'Ethically sourced, single-origin beans from around the world.',
  },
  {
    icon: faBolt,
    title: 'Fast Delivery',
    desc: 'Order online and get it delivered hot to your door.',
  },
];

export default function HeroClient({ tenant }: { tenant: Tenant }) {
  return (
    <div className="bg-brand-bg font-brand">

      {/* Hero section */}
      <section className="relative isolate overflow-hidden min-h-[480px] flex items-center">
        {tenant.assets.heroImage && (
          <Image
            src={tenant.assets.heroImage}
            alt={`${tenant.brandName} hero`}
            fill
            className="object-cover -z-10 opacity-25"
            priority
          />
        )}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 text-center w-full">
          <h1 className="text-5xl lg:text-7xl font-bold text-brand-secondary leading-tight drop-shadow-sm">
            {tenant.brandName}
          </h1>
          <p className="mt-5 text-xl text-brand-text/80 max-w-2xl mx-auto font-medium">
            Premium coffee, crafted for you. Every cup, a moment.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-brand-secondary text-brand-btn-text rounded-full px-10 py-3.5 font-bold text-base hover:opacity-90 hover:scale-105 transition-all shadow-lg"
            >
              Explore Menu
            </Link>
            <Link
              href="/about"
              className="border-2 border-brand-secondary text-brand-secondary rounded-full px-10 py-3.5 font-bold text-base hover:bg-brand-secondary hover:text-brand-btn-text transition-all"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className="bg-brand-card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow text-center border border-brand-muted/10"
          >
            <div className="w-16 h-16 bg-brand-secondary/10 rounded-2xl mx-auto mb-5 flex items-center justify-center">
              <FontAwesomeIcon icon={f.icon} className="text-brand-secondary text-2xl" />
            </div>
            <h3 className="font-bold text-lg text-brand-text mb-2">{f.title}</h3>
            <p className="text-brand-muted text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA strip */}
      <section className="bg-brand-secondary py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-brand-btn-text mb-4">
            Ready to order?
          </h2>
          <p className="text-brand-btn-text/80 mb-8 text-lg">
            Browse our full menu and get your favourite delivered.
          </p>
          <Link
            href="/menu"
            className="bg-brand-btn-text text-brand-secondary rounded-full px-10 py-3.5 font-bold text-base hover:opacity-90 transition-opacity inline-block shadow-md"
          >
            View Full Menu
          </Link>
        </div>
      </section>

    </div>
  );
}
