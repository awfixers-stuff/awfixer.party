import { Map, Users, Calendar } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getPageByPathServer, getRoleFormsForMarketing } from '@/lib/convex-server';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

const iconForSlug = (slug: string) => {
  if (slug.includes('region')) return Map;
  if (slug.includes('volunteer')) return Users;
  if (slug.includes('event')) return Calendar;
  return Users;
};

export const metadata: Metadata = {
  title: 'Help Out - AWFixer Party',
  description:
    'Join us in making a difference. Apply to be a Region Lead, Volunteer Lead, or Event Lead.',
};

export default async function HelpOutPage() {
  const cmsPage = await getPageByPathServer('/help-out');
  if (cmsPage?.bodyJson) {
    const html = tiptapJsonStringToHtml(cmsPage.bodyJson);
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{cmsPage.title}</h1>
        {html ? (
          <div
            className="prose prose-sm sm:prose-base max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-muted-foreground">No content yet.</p>
        )}
      </div>
    );
  }

  const roleCards = await getRoleFormsForMarketing();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          How Would You Like to Help?
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          We&apos;re building something great, and we need dedicated people like you. Choose a role
          that matches your skills and passion.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {roleCards.map((role) => {
          const Icon = iconForSlug(role.roleSlug);
          return (
            <div
              key={role.roleSlug}
              className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{role.title}</h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{role.description}</p>
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={`/help-out/${role.roleSlug}`}>Apply Now</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-xl border bg-muted/50 p-8 text-center">
        <h3 className="text-xl font-semibold">Not Sure Which Role is Right for You?</h3>
        <p className="mt-2 text-muted-foreground">
          All roles are important and rewarding. Choose the one that excites you most, or apply to
          multiple roles.
        </p>
      </div>
    </div>
  );
}
