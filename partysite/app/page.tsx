import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { getPageByPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'AWFixer Party',
  description:
    "AWFixer Politics — not affiliated with AWFixer's Lounge or AWFixer Enterprising Company.",
  ...ogMetadata('AWFixer Party', {
    description:
      'Community and updates for AWFixer Party. Independent. Transparent. Community-driven.',
  }),
};

export default async function Page() {
  const cmsPage = await getPageByPathServer('/');
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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col gap-6">
        <h1 className="text-4xl font-bold">Coming Soon</h1>
        <p className="text-muted-foreground">
          AWFixer Politics is not Affiliated with AWFixer&apos;s Lounge or AWFixer Enterprising
          Company
        </p>
        <Button asChild>
          <a href="https://discord.awfixer.party" target="_blank" rel="noopener noreferrer">
            Community
          </a>
        </Button>
      </div>
    </div>
  );
}
