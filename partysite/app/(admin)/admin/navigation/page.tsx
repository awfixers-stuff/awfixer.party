import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isAllowedAdminOrganization } from '@/lib/admin/orgs';

import { NavigationAdminClient } from './navigation-admin-client';

export const metadata: Metadata = {
  title: 'Navigation - Admin',
  robots: { index: false, follow: false },
};

export default async function AdminNavigationPage() {
  const { userId, orgId } = await auth();
  if (!userId || !isAllowedAdminOrganization(orgId)) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Navigation</h1>
        <p className="text-muted-foreground text-sm">
          Edit nav dropdowns — standard groups, community links, and resource links powered by
          the link shortener.
        </p>
      </div>
      <NavigationAdminClient />
    </div>
  );
}
