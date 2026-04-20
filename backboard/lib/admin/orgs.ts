/** Comma-separated Clerk organization IDs allowed to use `/admin` and Convex admin APIs. */
function parseAdminOrganizationIdsFromRaw(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Resolved allowlist from server env (use in Server Components / route handlers). */
export function getAdminOrganizationIds(): string[] {
  return parseAdminOrganizationIdsFromRaw(process.env.ADMIN_CLERK_ORGANIZATION_IDS ?? '');
}

export function getAdminOrganizationIdSet(): Set<string> {
  return new Set(getAdminOrganizationIds());
}

export function isAllowedAdminOrganization(orgId: string | null | undefined): boolean {
  if (!orgId) return false;
  return getAdminOrganizationIdSet().has(orgId);
}
