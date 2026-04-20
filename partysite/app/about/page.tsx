import { Metadata } from 'next';
import Link from 'next/link';

import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import { getPageByPathServer, getTocForPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'About - AWFixer Party',
  description: 'Learn about who we are and what we stand for.',
  ...ogMetadata('About - AWFixer Party', {
    description: 'Learn about who we are and what we stand for.',
  }),
};

export default async function AboutPage() {
  const cmsPage = await getPageByPathServer('/about');
  const tocItems = await getTocForPathServer('/about');
  if (cmsPage?.bodyJson) {
    const html = tiptapJsonStringToHtml(cmsPage.bodyJson);
    return (
      <InfoPageLayout
        title={cmsPage.title}
        description={cmsPage.description}
        backHref=""
        items={tocItems}
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-muted-foreground">No content yet.</p>
        )}
      </InfoPageLayout>
    );
  }
  return (
    <InfoPageLayout
      title="About AWFixer Party"
      description="Independent. Transparent. Community-driven."
      backHref=""
      items={tocItems}
    >
      <p>
        AWFixer Party is an independent political organization dedicated to representing the
        interests of our community. We believe in transparency, accountability, and putting people
        first.
      </p>

      <h2 id="what-we-stand-for">What We Stand For</h2>
      <ul>
        <li>Transparency in government and organizations</li>
        <li>Community involvement in decision-making</li>
        <li>Privacy and data rights for all</li>
        <li>Independent thinking over party lines</li>
      </ul>

      <h2 id="get-involved">Get Involved</h2>
      <p>
        We believe that everyone should have a voice in how they&apos;re governed. Join us in making
        a difference.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link href="/about/values" className="text-primary underline hover:no-underline">
          Our Values &rarr;
        </Link>
        <Link href="/about/mission" className="text-primary underline hover:no-underline">
          Our Mission &rarr;
        </Link>
      </div>
    </InfoPageLayout>
  );
}
