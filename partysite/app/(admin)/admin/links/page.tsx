import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isAllowedAdminOrganization } from '@/lib/admin/orgs';

import { LinksAdminClient } from './links-admin-client';

export const metadata: Metadata = {
  title: 'Short links - Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLinksPage() {
  const { userId, orgId } = await auth();
  if (!userId || !isAllowedAdminOrganization(orgId)) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Short links</h1>
        <p className="text-muted-foreground text-sm">
          Create and manage short URLs backed by Convex. Redirects are served from your
          deployment&apos;s HTTP router at{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/r/…</code>.
        </p>
      </div>
      <LinksAdminClient />
    </div>
  );
}
