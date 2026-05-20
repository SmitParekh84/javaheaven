import { cache } from 'react';
import { DEFAULT_TENANT, Tenant, TenantCSSVars } from '@/types/tenant';
import { connectDB } from './db';
import TenantModel from '@/models/Tenant';

/** Fetch tenant config by domain. Queries MongoDB directly (server-only). */
export const getTenantByDomain = cache(async (domain: string): Promise<Tenant> => {
  try {
    await connectDB();
    const tenant = await TenantModel.findOne({ domain }).lean();
    if (!tenant) return DEFAULT_TENANT;
    return tenant as unknown as Tenant;
  } catch {
    return DEFAULT_TENANT;
  }
});

/** Fetch tenant config by tenantId slug. */
export const getTenantById = cache(async (tenantId: string): Promise<Tenant> => {
  try {
    await connectDB();
    const tenant = await TenantModel.findOne({ tenantId }).lean();
    if (!tenant) return DEFAULT_TENANT;
    return tenant as unknown as Tenant;
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
