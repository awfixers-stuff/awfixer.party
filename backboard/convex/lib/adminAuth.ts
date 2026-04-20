import type { Auth, UserIdentity } from 'convex/server';
import { ConvexError } from 'convex/values';

import type { MutationCtx, QueryCtx } from '../_generated/server';

type Ctx = QueryCtx | MutationCtx;

/** Same checks as {@link requireAdminOrg} for call sites that only have `auth` (e.g. component wrappers). */
export async function requireAdminIdentity(auth: Auth): Promise<UserIdentity> {
  let identity: UserIdentity | null;
  try {
    identity = await auth.getUserIdentity();
  } catch (err) {
    console.error('Failed to get user identity:', err);
    throw new ConvexError('Authentication failed');
  }

  if (!identity) {
    throw new ConvexError('Not authenticated');
  }

  const orgId = orgIdFromIdentity(identity);
  if (!orgId) {
    console.log('Admin auth failed: missing org_id in session for subject', identity.subject);
    throw new ConvexError(
      "Missing organization in session. Ensure the Clerk Convex JWT template includes 'org_id': '{{org.id}}' and you have an active organization selected.",
    );
  }

  const allowed = parseAdminOrgIds();
  if (allowed.size === 0) {
    console.error('Admin access is not configured: ADMIN_CLERK_ORGANIZATION_IDS is empty');
    throw new ConvexError('Admin access is not configured on this deployment.');
  }

  if (!allowed.has(orgId)) {
    console.log('Admin auth failed: org not in allowlist for subject', identity.subject);
    throw new ConvexError('Not authorized');
  }

  return identity;
}

export function parseAdminOrgIds(): Set<string> {
  try {
    const raw = process.env.ADMIN_CLERK_ORGANIZATION_IDS ?? '';
    return new Set(
      raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  } catch (err) {
    console.error('Failed to parse ADMIN_CLERK_ORGANIZATION_IDS:', err);
    throw new ConvexError('Admin access is not configured on this deployment.');
  }
}

export function orgIdFromIdentity(identity: UserIdentity): string | null {
  const ext = identity as any;
  const candidates = [
    ext.org_id,
    ext.orgId,
    ext.organization_id,
    ext.organizationId,
    ext.o,
    ext.org,
  ];

  for (const val of candidates) {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && typeof val.id === 'string') return val.id;
  }

  return null;
}

export async function requireAdminOrg(ctx: Ctx): Promise<UserIdentity> {
  return requireAdminIdentity(ctx.auth);
}

/** Stable admin tenant id for shared resources (e.g. short links owned by the org). */
export async function requireAdminOrgId(ctx: Ctx): Promise<string> {
  const identity = await requireAdminIdentity(ctx.auth);
  const orgId = orgIdFromIdentity(identity);
  if (!orgId) {
    throw new ConvexError('Missing organization in session.');
  }
  return orgId;
}
