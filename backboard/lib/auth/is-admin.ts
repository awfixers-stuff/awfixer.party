import { isAllowedAdminOrganization } from '@/lib/admin/orgs';

/**
 * Server-side: Clerk session active org matches allowlist (same rule as Convex admin APIs).
 * On the client, use `useIsActiveOrgAdmin` from `@/components/admin/admin-allowlist-provider`.
 */
export async function checkIsAdmin(orgId: string | null | undefined): Promise<boolean> {
  return isAllowedAdminOrganization(orgId);
}
