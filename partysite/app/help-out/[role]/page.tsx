import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { DEFAULT_HELP_OUT_ROLES } from '@/convex/defaults';
import {
  getConvexDeploymentUrl,
  getFormPicklistsServer,
  getHelpOutFormByRoleCached,
} from '@/lib/convex-server';

import { HelpOutRoleEditButton } from '@/components/help-out/help-out-role-edit-button';

import { HelpOutFormClient } from './help-out-form-client';

type PageProps = { params: Promise<{ role: string }> };

const LEGACY_SLUGS = new Set(DEFAULT_HELP_OUT_ROLES.map((r) => r.roleSlug));

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { role } = await props.params;
  const form = await getHelpOutFormByRoleCached(role);
  if (form) {
    return {
      title: `Apply for ${form.title} - AWFixer Party`,
      description: `Apply to be a ${form.title} and help us make a difference.`,
    };
  }
  const title = role.replace(/_/g, ' ');
  return {
    title: `Apply for ${title} - AWFixer Party`,
    description: `Apply to help us make a difference.`,
  };
}

export default async function HelpOutRolePage(props: PageProps) {
  const { role } = await props.params;
  const url = getConvexDeploymentUrl();
  const form = await getHelpOutFormByRoleCached(role);

  if (url) {
    if (!form) {
      redirect('/help-out');
    }
  } else if (!LEGACY_SLUGS.has(role)) {
    redirect('/help-out');
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/help-out/' + role);
  }

  const pageTitle = form?.title ?? role.replace(/_/g, ' ');
  const picklists = await getFormPicklistsServer();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <HelpOutRoleEditButton roleSlug={role} />
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Apply for {pageTitle}</h1>
        <p className="mt-3 text-muted-foreground">
          Fill out the form below and we&apos;ll be in touch.
        </p>
      </div>
      <HelpOutFormClient roleSlug={role} initialForm={form} initialPicklists={picklists} />
    </div>
  );
}
