import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons'; // Import the specific icons you need

const FooterSection = ({ title, links }) => (
  <div className="mr-10">
    <h3 className="font-semibold mb-2 text-primary-foreground">{title}</h3>
    <ul className="space-y-1">
      {links.map(({ to, href, label, ariaLabel }) => (
        <li key={label}>
          {href ? (
            <a href={href} aria-label={ariaLabel} className="text-muted-foreground hover:text-primary transition-colors duration-200">
              {label}
            </a>
          ) : (
            <Link to={to} className="text-muted-foreground hover:text-primary transition-colors duration-200" aria-label={ariaLabel}>
              {label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);
const SocialMediaLink = ({ href, label, ariaLabel, icon }) => (
  <a href={href} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer" className="flex items-center">
    <FontAwesomeIcon icon={icon} className="text-primary-foreground h-5 w-5" />

  </a>
);


export default function Footer() {
  const aboutUsLinks = [
    { to: "/about", label: "Our Story", ariaLabel: "Learn about our story" },
    { to: "/leadership-team", label: "Leadership Team", ariaLabel: "Meet our leadership team" },
    { to: "/menu", label: "Our Menu", ariaLabel: "Explore our menu" },
  ];

  const responsibilityLinks = [
    { href: "#", label: "Diversity", ariaLabel: "Learn about our diversity initiatives" },
    { href: "#", label: "Community", ariaLabel: "Read about our community efforts" },
    { href: "#", label: "Ethical Sourcing", ariaLabel: "Understand our ethical sourcing" },
    { href: "#", label: "Environmental Stewardship", ariaLabel: "Explore our environmental stewardship" },
  ];

  const quickLinks = [
    { href: "#", label: "Privacy Policy", ariaLabel: "Read our privacy policy" },
    { href: "#", label: "FAQs", ariaLabel: "Frequently asked questions" },
    { to: "/get-help", label: "Customer Service", ariaLabel: "Contact our customer service" },
    { href: "#", label: "Delivery Info", ariaLabel: "Learn about our delivery options" },
  ];

  const socialMediaLinks = [
    { href: 'https://facebook.com', label: 'Facebook', ariaLabel: 'Facebook', icon: faFacebook },
    { href: 'https://twitter.com', label: 'Twitter', ariaLabel: 'Twitter', icon: faTwitter },
    { href: 'https://instagram.com', label: 'Instagram', ariaLabel: 'Instagram', icon: faInstagram },
    { href: 'https://linkedin.com', label: 'LinkedIn', ariaLabel: 'LinkedIn', icon: faLinkedin },
  ];

  return (
    <footer className="bg-secondary text-foreground w-full mt-16 px-10 ">
      <div className="container mx-auto flex flex-col md:flex-row justify-between py-10 lg:px-20">
        <div className="flex justify-around items-center mb-6 md:mb-0">
          <img
            src="/images/logo-muted-2.png"
            alt="Java Heaven Coffee Logo"
            className="max-h-44  sm:max-h-52 sm:max-w-7xl"
          />
        </div>
        <div className="flex justify-around  flex-col md:flex-row md:space-x-10">
          <FooterSection title="About Us" links={aboutUsLinks} />
          <FooterSection title="Responsibility" links={responsibilityLinks} />
          <FooterSection title="Quick Links" links={quickLinks} />
        </div>
        <div className="mt-6 md:mt-0">
          <h3 className="font-semibold mb-2 text-primary-foreground">Social Media</h3>
          <div className="flex space-x-4">
            {socialMediaLinks.map(({ href, label, ariaLabel, icon }) => (
              <SocialMediaLink key={href} href={href} label={label} ariaLabel={ariaLabel} icon={icon} />
            ))}
          </div>
        </div>
      </div>
      <div className="text-center mt-8 text-sm text-muted-foreground px-4">
        <p className="mb-1">Web Accessibility | Privacy Statement | Terms of Use | Contact Us</p>
        <p>© 2024 Java Heaven Coffee Company. All rights reserved. Developed by Smit Parekh and Preet Patel.</p>
      </div>
    </footer>

  );
}