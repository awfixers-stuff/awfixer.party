import { Metadata } from 'next';

import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import { getPageByPathServer, getTocForPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'Our Values - AWFixer Party',
  description: 'The core values that guide our work and decisions.',
  ...ogMetadata('Our Values - AWFixer Party', {
    description: 'The core values that guide our work and decisions.',
  }),
};

export default async function ValuesPage() {
  const cmsPage = await getPageByPathServer('/about/values');
  const tocItems = await getTocForPathServer('/about/values');
  if (cmsPage?.bodyJson) {
    const html = tiptapJsonStringToHtml(cmsPage.bodyJson);
    return (
      <InfoPageLayout
        title={cmsPage.title}
        description={cmsPage.description}
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
      title="Our Values"
      description="The principles that guide everything we do."
      items={tocItems}
    >
      <h2 id="transparency">Transparency</h2>
      <p>
        We believe in open and honest communication. Our decisions, funding, and processes should be
        and accessible to everyone. We have nothing to hide.
      </p>

      <h2 id="community-first">Community First</h2>
      <p>
        The people we serve are at the heart of every decision we make. We listen to diverse
        perspectives and work to represent everyone&apos;s interests.
      </p>

      <h2 id="privacy">Privacy</h2>
      <p>
        We champion the right to privacy and data protection. In an age of constant tracking, we
        believe individuals should have control over their personal information.
      </p>

      <h2 id="independence">Independence</h2>
      <p>
        We don&apos;t answer to special interests or party machines. Our only loyalty is to the
        community we serve and the principles we believe in.
      </p>

      <h2 id="accountability">Accountability</h2>
      <p>
        We hold ourselves to the highest standards. When we make mistakes, we own them. When we
        promise something, we deliver it.
      </p>
    </InfoPageLayout>
  );
}
