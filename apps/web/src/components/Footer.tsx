import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { Tenant } from '@/types/tenant';

interface FooterLink { label: string; href?: string; to?: string; }

const FooterSection = ({ title, links }: { title: string; links: FooterLink[] }) => (
  <div>
    <h3 className="font-semibold mb-3 text-brand-primary">{title}</h3>
    <ul className="space-y-1.5">
      {links.map(({ label, href, to }) => (
        <li key={label}>
          {to ? (
            <Link href={to} className="text-sm text-brand-muted hover:text-brand-primary transition-colors">{label}</Link>
          ) : (
            <a href={href ?? '#'} className="text-sm text-brand-muted hover:text-brand-primary transition-colors">{label}</a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer({ tenant }: { tenant: Tenant }) {
  const aboutLinks: FooterLink[] = [
    { label: 'Our Story',      to: '/about' },
    { label: 'Leadership Team', to: '/leadership-team' },
    { label: 'Our Menu',       to: '/menu' },
  ];
  const responsibilityLinks: FooterLink[] = [
    { label: 'Diversity',                href: '#' },
    { label: 'Community',                href: '#' },
    { label: 'Ethical Sourcing',         href: '#' },
    { label: 'Environmental Stewardship', href: '#' },
  ];
  const quickLinks: FooterLink[] = [
    { label: 'Privacy Policy',  href: '#' },
    { label: 'FAQs',            href: '#' },
    { label: 'Customer Service', to: '/get-help' },
    { label: 'Delivery Info',   href: '#' },
  ];

  const socialIcons = [
    { icon: faFacebook,  href: tenant.social.facebook  ?? '#', label: 'Facebook' },
    { icon: faTwitter,   href: tenant.social.twitter   ?? '#', label: 'Twitter' },
    { icon: faInstagram, href: tenant.social.instagram ?? '#', label: 'Instagram' },
    { icon: faLinkedin,  href: tenant.social.linkedin  ?? '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-brand-secondary text-brand-primary w-full mt-16">
      <div className="container mx-auto px-8 lg:px-20 py-10 flex flex-col md:flex-row justify-between gap-10">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src={tenant.assets.footerLogoUrl}
            alt={`${tenant.brandName} logo`}
            width={160}
            height={160}
            className="max-h-44 w-auto object-contain"
          />
        </div>

        {/* Link columns */}
        <div className="flex flex-col md:flex-row gap-10">
          <FooterSection title="About Us"       links={aboutLinks} />
          <FooterSection title="Responsibility" links={responsibilityLinks} />
          <FooterSection title="Quick Links"    links={quickLinks} />
        </div>

        {/* Social */}
        <div>
          <h3 className="font-semibold mb-3 text-brand-primary">Follow Us</h3>
          <div className="flex gap-4">
            {socialIcons.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-brand-muted transition-colors"
              >
                <FontAwesomeIcon icon={icon} className="h-5 w-5" />
              </a>
            ))}
          </div>
          <div className="mt-4 text-sm text-brand-muted space-y-1">
            <p>{tenant.contact.email}</p>
            <p>{tenant.contact.phone}</p>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-brand-muted border-t border-brand-primary/10 px-4">
        <p>© {new Date().getFullYear()} {tenant.brandName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
