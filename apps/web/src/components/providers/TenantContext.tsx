'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_TENANT, Tenant } from '@/types/tenant';

const TenantContext = createContext<Tenant>(DEFAULT_TENANT);

export const useTenant = () => useContext(TenantContext);

export default TenantContext;
