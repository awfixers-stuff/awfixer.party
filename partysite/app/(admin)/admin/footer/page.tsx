import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isAllowedAdminOrganization } from '@/lib/admin/orgs';

import { FooterAdminClient } from './footer-admin-client';

export const metadata: Metadata = {
  title: 'Footer - Admin',
  robots: { index: false, follow: false },
};

export default async function AdminFooterPage() {
  const { userId, orgId } = await auth();
  if (!userId || !isAllowedAdminOrganization(orgId)) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Footer</h1>
        <p className="text-muted-foreground text-sm">
          Edit the site footer — brand info, link columns, and copyright text.
        </p>
      </div>
      <FooterAdminClient />
    </div>
  );
}
