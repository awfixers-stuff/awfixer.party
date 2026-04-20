import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { isAllowedAdminOrganization } from '@/lib/admin/orgs';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!process.env.ADMIN_CLERK_ORGANIZATION_IDS?.trim()) {
    throw new Error(
      'ADMIN_CLERK_ORGANIZATION_IDS is not configured. Set it to one or more Clerk organization IDs (comma-separated) before using /admin.',
    );
  }

  const { userId, orgId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  if (!isAllowedAdminOrganization(orgId)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:px-8 lg:px-10 xl:px-12">
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
