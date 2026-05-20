'use client';

import { Toaster } from 'react-hot-toast';
import TenantContext from './TenantContext';
import { CartProvider } from './CartContext';
import { UserProvider } from './UserContext';
import { Tenant } from '@/types/tenant';

export default function Providers({
  children,
  tenant,
}: {
  children: React.ReactNode;
  tenant: Tenant;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      <UserProvider>
        <CartProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </CartProvider>
      </UserProvider>
    </TenantContext.Provider>
  );
}
