'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import * as React from 'react';

const AdminAllowlistContext = React.createContext<readonly string[] | null>(null);

export function AdminAllowlistProvider({
  children,
  allowedAdminOrganizationIds,
}: {
  children: React.ReactNode;
  allowedAdminOrganizationIds: readonly string[];
}) {
  return (
    <AdminAllowlistContext.Provider value={allowedAdminOrganizationIds}>
      {children}
    </AdminAllowlistContext.Provider>
  );
}

export function useAdminAllowlist(): readonly string[] {
  const ctx = React.useContext(AdminAllowlistContext);
  if (!ctx) {
    throw new Error('useAdminAllowlist must be used within AdminAllowlistProvider');
  }
  return ctx;
}

/**
 * True when the user is signed in, Clerk is loaded, and the *active* organization id is in the
 * server-injected allowlist (same rule as Convex `requireAdminOrg`).
 */
export function useIsActiveOrgAdmin(): { isAdmin: boolean; isReady: boolean } {
  const allowlist = useAdminAllowlist();
  const { isLoaded: userLoaded, user } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const allowSet = React.useMemo(() => new Set(allowlist), [allowlist]);

  const isReady = Boolean(userLoaded && orgLoaded);
  if (!isReady) {
    return { isAdmin: false, isReady: false };
  }
  if (!user) {
    return { isAdmin: false, isReady: true };
  }
  const orgId = organization?.id;
  if (!orgId) {
    return { isAdmin: false, isReady: true };
  }
  return { isAdmin: allowSet.has(orgId), isReady: true };
}
