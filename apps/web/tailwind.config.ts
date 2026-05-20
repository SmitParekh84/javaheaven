import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // All brand colors driven by CSS variables — set per tenant
        brand: {
          primary:    'var(--color-primary)',
          secondary:  'var(--color-secondary)',
          accent:     'var(--color-accent)',
          text:       'var(--color-text)',
          muted:      'var(--color-muted)',
          bg:         'var(--color-bg)',
          card:       'var(--color-card)',
          'btn-text': 'var(--color-btn-text)',
        },
        // Static utility colors kept for admin/UI chrome
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        brand: ['var(--font-brand)', 'sans-serif'],
        spartan: ['"League Spartan"', 'sans-serif'],
      },
      zIndex: {
        '100': '100',
        '200': '200',
      },
    },
  },
  plugins: [],
};

export default config;
