import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isAllowedAdminOrganization } from '@/lib/admin/orgs';

import { SubmissionsClient } from './submissions-client';

export const metadata: Metadata = {
  title: 'Submissions - Admin',
};

export default async function SubmissionsPage() {
  const { userId, orgId } = await auth();
  if (!userId || !isAllowedAdminOrganization(orgId)) {
    redirect('/');
  }

  return <SubmissionsClient />;
}
