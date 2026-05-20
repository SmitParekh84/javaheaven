import type { Metadata } from 'next';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';

export const metadata: Metadata = {
  title: 'Leadership Team',
  description: 'Meet the passionate team behind the brand.',
};

const DEFAULT_IMG = 'https://cloud-atg.moph.go.th/quality/sites/default/files/default_images/default.png';

const teamMembers = [
  {
    name: 'Smit Parekh',
    title: 'Project Manager & Full-Stack Developer',
    position: 'Founder & CEO',
    image: '/Smit-Parekh.jpg',
    description:
      'With a solid foundation in both project management and full-stack development, Smit combines technical expertise with leadership skills. He excels in driving projects from conception to completion, ensuring that each phase aligns with strategic goals.',
    links: {
      linkedin: 'https://linkedin.com/in/smitparekh84',
      github: 'https://github.com/SmitParekh84',
      instagram: 'https://www.instagram.com/smit_8_4',
    },
  },
  {
    name: 'Preet Patel',
    title: 'Back-End Developer & White Box Tester',
    position: 'Co-Founder & COO',
    image: '/Preet-Patel.jpg',
    description:
      'Preet is a talented back-end developer with a keen eye for detail. His expertise in white box testing ensures that the systems we build are robust and efficient. His ability to identify potential issues contributes significantly to software quality.',
    links: {
      linkedin: 'https://www.linkedin.com/in/preet-patel-8b4617256/',
      github: 'https://github.com/preetpatel9341',
      instagram: 'https://www.instagram.com/preetpatel9341',
    },
  },
  {
    name: 'Dhru Patel',
    title: 'Quality Assurance Tester',
    position: 'QA Lead',
    image: '/Dhru-Patel.jpg',
    description:
      'Dhru is dedicated to ensuring that our products meet the highest standards of quality. With a strong background in testing methodologies, he meticulously evaluates software functionality, performance, and usability.',
    links: {
      linkedin: 'https://www.linkedin.com/in/dhru-patel-3849892b3',
      github: 'https://github.com/PatelDHRU26',
      instagram: 'https://www.instagram.com/dp_dhru',
    },
  },
];

export default function LeadershipTeamPage() {
  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <h1 className="text-4xl font-bold text-center text-brand-text mb-2">Our Leadership Team</h1>
        <p className="text-brand-muted text-center mb-14 text-lg">The people behind the passion.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {teamMembers.map((m) => (
            <div
              key={m.name}
              className="bg-brand-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <a href={m.links.linkedin} target="_blank" rel="noopener noreferrer">
                <div className="relative h-52 w-full bg-brand-accent">
                  <Image
                    src={m.image || DEFAULT_IMG}
                    alt={m.name}
                    fill
                    className="object-cover object-top hover:opacity-80 transition-opacity duration-300"
                  />
                </div>
              </a>

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-brand-text">{m.name}</h2>
                <p className="text-sm text-brand-muted mt-0.5">{m.title}</p>
                <p className="text-sm font-semibold text-brand-secondary mb-3">{m.position}</p>
                <p className="text-brand-muted text-sm leading-relaxed flex-grow">{m.description}</p>

                <div className="flex gap-4 mt-5">
                  {m.links.linkedin && (
                    <a
                      href={m.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} on LinkedIn`}
                      className="text-brand-muted hover:text-brand-secondary transition-colors"
                    >
                      <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
                    </a>
                  )}
                  {m.links.github && (
                    <a
                      href={m.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} on GitHub`}
                      className="text-brand-muted hover:text-brand-secondary transition-colors"
                    >
                      <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
                    </a>
                  )}
                  {m.links.instagram && (
                    <a
                      href={m.links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} on Instagram`}
                      className="text-brand-muted hover:text-brand-secondary transition-colors"
                    >
                      <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
