import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LegalSlugEditButton } from '@/components/legal/legal-slug-edit-button';
import { LegalPageLayout } from '@/components/legal-page/legal-page-layout';
import {
  getPageByPathServer,
  getTocForPathServer,
  listPublishedLegalSlugsCached,
  getConvexDeploymentUrl,
} from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export async function generateStaticParams() {
  if (!getConvexDeploymentUrl()) {
    return [{ slug: 'privacy' }, { slug: 'terms' }, { slug: 'ccpa' }];
  }
  const slugs = await listPublishedLegalSlugsCached();
  if (slugs.length > 0) {
    return slugs.map((slug) => ({ slug }));
  }
  return [{ slug: 'privacy' }, { slug: 'terms' }, { slug: 'ccpa' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = `/legal/${slug}`;
  const page = await getPageByPathServer(path);
  if (!page) {
    return { title: 'Legal - AWFixer Party' };
  }
  const title = `${page.title} - AWFixer Party`;
  const desc = page.description ?? page.title;
  return {
    title,
    description: desc,
    ...ogMetadata(title, { description: desc }),
  };
}

export default async function LegalSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = `/legal/${slug}`;
  const page = await getPageByPathServer(path);
  if (!page) {
    notFound();
  }
  const html = tiptapJsonStringToHtml(page.bodyJson);
  const tocItems = await getTocForPathServer(path);

  return (
    <>
      <LegalSlugEditButton path={path} />
      <LegalPageLayout title={page.title} lastUpdated={page.lastUpdatedLabel} items={tocItems}>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-muted-foreground">No content yet.</p>
      )}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/legal/privacy" className="text-primary underline hover:no-underline">
          Privacy Policy
        </Link>
        <Link href="/legal/terms" className="text-primary underline hover:no-underline">
          Terms of Service
        </Link>
        <Link href="/legal/ccpa" className="text-primary underline hover:no-underline">
          CCPA Notice
        </Link>
      </div>
    </LegalPageLayout>
    </>
  );
}
