import { cache } from 'react';
import { DEFAULT_TENANT, Tenant, TenantCSSVars } from '@/types/tenant';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** Fetch tenant config by domain. Uses React's cache() so one request per render tree. */
export const getTenantByDomain = cache(async (domain: string): Promise<Tenant> => {
  try {
    const res = await fetch(`${API_URL}/api/tenant?domain=${encodeURIComponent(domain)}`, {
      next: { revalidate: 300 }, // cache for 5 minutes
    });
    if (!res.ok) return DEFAULT_TENANT;
    const data = await res.json();
    return data as Tenant;
  } catch {
    return DEFAULT_TENANT;
  }
});

/** Fetch tenant config by tenantId slug. */
export const getTenantById = cache(async (tenantId: string): Promise<Tenant> => {
  try {
    const res = await fetch(`${API_URL}/api/tenant?id=${encodeURIComponent(tenantId)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULT_TENANT;
    return (await res.json()) as Tenant;
  } catch {
    return DEFAULT_TENANT;
  }
});

/** Convert TenantTheme to CSS custom property map */
export function buildCSSVars(tenant: Tenant): TenantCSSVars {
  const t = tenant.theme;
  return {
    '--color-primary':   t.primaryColor,
    '--color-secondary': t.secondaryColor,
    '--color-accent':    t.accentColor,
    '--color-text':      t.textColor,
    '--color-muted':     t.mutedColor,
    '--color-bg':        t.bgColor,
    '--color-card':      t.cardColor,
    '--color-btn-text':  t.btnTextColor,
    '--font-brand':      `"${t.fontFamily}"`,
  };
}

/** Serialize CSS vars map to inline <style> string */
export function cssVarsToString(vars: TenantCSSVars): string {
  const entries = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${entries}\n}`;
}
