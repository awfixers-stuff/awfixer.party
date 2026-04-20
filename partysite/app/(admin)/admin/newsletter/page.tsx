import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isAllowedAdminOrganization } from '@/lib/admin/orgs';

import { NewsletterAdminClient } from './newsletter-admin-client';

export const metadata: Metadata = {
  title: 'Newsletter - Admin',
  robots: { index: false, follow: false },
};

export default async function AdminNewsletterPage() {
  const { userId, orgId } = await auth();
  if (!userId || !isAllowedAdminOrganization(orgId)) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
        <p className="text-muted-foreground text-sm">
          Configure the footer newsletter widget (Substack embed and copy).
        </p>
      </div>
      <NewsletterAdminClient />
    </div>
  );
}
