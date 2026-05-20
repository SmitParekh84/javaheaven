import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import { getTenantByDomain } from '@/lib/tenant';
import { JsonLd } from '@/components/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const tenant = await getTenantByDomain(domain);
  return {
    title: 'About',
    description: `Learn about ${tenant.brandName}'s coffee brewing philosophy and story.`,
  };
}

export default async function AboutPage() {
  const domain = (await headers()).get('x-tenant-domain') ?? 'localhost';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${domain}`;
  const tenant = await getTenantByDomain(domain);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${tenant.brandName}`,
    url: `${baseUrl}/about`,
    description: `Learn about ${tenant.brandName}'s coffee brewing philosophy and story.`,
    publisher: {
      '@type': 'Organization',
      name: tenant.brandName,
      url: baseUrl,
      logo: tenant.assets.logoUrl.startsWith('/') ? `${baseUrl}${tenant.assets.logoUrl}` : tenant.assets.logoUrl,
    },
  };

  const sections = [
    {
      image: '/images/barista-coffee-brewing.jpg',
      alt: 'Barista preparing cappuccino',
      title: 'Our Brewing Philosophy',
      body: `${tenant.brandName} is a coffee lover's paradise, where the art of brewing transcends mere routine. We explore the intricacies of manual brewing techniques, such as pour-over, that elevate the flavor profile of every cup. From hands-on methods to cutting-edge machines, our approach ensures a remarkable experience that enhances the taste and quality of your coffee.`,
      reverse: false,
    },
    {
      image: '/images/coffee-beans-background.jpg',
      alt: 'Variety of coffee beans',
      title: 'Sourcing the Finest Beans',
      body: 'The choice of coffee beans and their grind size plays a crucial role in determining the flavor of your brew. Each type of bean offers a unique array of flavors and aromas, making every brewing session an adventure in taste.',
      reverse: true,
    },
    {
      image: '/images/coffee-machine-making-perfect-cup-coffee.jpg',
      alt: 'Coffee machine brewing coffee',
      title: 'State-of-the-Art Equipment',
      body: 'Our state-of-the-art coffee machines provide unmatched consistency in brewing. By automating the process, they allow for precise control over critical brewing variables like temperature and timing, ensuring a perfect cup every time.',
      reverse: false,
    },
  ];

  return (
    <>
    <JsonLd data={schema} />
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <h1 className="text-4xl font-bold text-brand-text mb-2">About {tenant.brandName}</h1>
        <p className="text-brand-muted text-lg mb-14">Our story, our craft, our passion.</p>

        <div className="space-y-20">
          {sections.map((s) => (
            <section
              key={s.title}
              className={`flex flex-col gap-10 ${s.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}
            >
              <div className="lg:w-1/2 relative h-72 w-full rounded-2xl overflow-hidden shadow-lg">
                <Image src={s.image} alt={s.alt} fill className="object-cover" />
              </div>
              <div className="lg:w-1/2">
                <h2 className="text-2xl font-semibold text-brand-text mb-4">{s.title}</h2>
                <p className="text-brand-muted leading-relaxed text-lg">{s.body}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 bg-brand-card rounded-2xl p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-brand-text mb-4">Why {tenant.brandName} Matters</h2>
          <p className="text-brand-muted leading-relaxed text-lg">
            Brewing coffee goes beyond simply combining ground beans with hot water. It involves a deep understanding of how temperature, grind size, brewing time, and equipment can dramatically influence the flavor profile of your coffee. Even the same beans can yield vastly different tastes depending on the brewing method employed!
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
