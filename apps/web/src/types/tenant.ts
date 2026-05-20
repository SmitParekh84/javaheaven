export interface TenantTheme {
  primaryColor:   string;  // main brand color (buttons, accents)
  secondaryColor: string;  // secondary brand color
  accentColor:    string;  // background tint
  textColor:      string;  // primary text
  mutedColor:     string;  // muted/placeholder text
  bgColor:        string;  // page background
  cardColor:      string;  // card/surface background
  btnTextColor:   string;  // text on primary buttons
  fontFamily:     string;  // Google Font name
}

export interface TenantAssets {
  logoUrl:       string;
  faviconUrl:    string;
  heroImage:     string;
  footerLogoUrl: string;
}

export interface TenantContact {
  email:   string;
  phone:   string;
  address: string;
}

export interface TenantSocial {
  instagram?: string;
  facebook?:  string;
  twitter?:   string;
  linkedin?:  string;
}

export interface Tenant {
  _id:       string;
  tenantId:  string;       // slug, e.g. "brew-bliss"
  domain:    string;       // e.g. "coffeeshop-a.com"
  brandName: string;
  active:    boolean;
  theme:     TenantTheme;
  assets:    TenantAssets;
  contact:   TenantContact;
  social:    TenantSocial;
  createdAt: string;
  updatedAt: string;
}

/** CSS variable map injected into <style> by the root layout */
export interface TenantCSSVars {
  '--color-primary':    string;
  '--color-secondary':  string;
  '--color-accent':     string;
  '--color-text':       string;
  '--color-muted':      string;
  '--color-bg':         string;
  '--color-card':       string;
  '--color-btn-text':   string;
  '--font-brand':       string;
}

export const DEFAULT_TENANT: Omit<Tenant, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } = {
  _id:       'default',
  tenantId:  'javaheaven',
  domain:    'localhost',
  brandName: 'Java Heaven',
  active:    true,
  theme: {
    primaryColor:   '#F5F5DC',
    secondaryColor: '#503225',
    accentColor:    '#FDF8F0',
    textColor:      '#1A1A1A',
    mutedColor:     '#D3D3D3',
    bgColor:        '#F5F5DC',
    cardColor:      '#FFFFFF',
    btnTextColor:   '#F5F5DC',
    fontFamily:     'League Spartan',
  },
  assets: {
    logoUrl:       '/images/logo-3.png',
    faviconUrl:    '/favicon.png',
    heroImage:     '/images/coffee-machine-making-perfect-cup-coffee.jpg',
    footerLogoUrl: '/images/logo-muted-2.png',
  },
  contact: {
    email:   'hello@javaheaven.me',
    phone:   '+91 00000 00000',
    address: '2nd Floor, Maruti Solaris Mall, Anand, Gujarat',
  },
  social: {
    instagram: 'https://instagram.com',
    facebook:  'https://facebook.com',
  },
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};
