import { Metadata } from 'next';

import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import { getPageByPathServer, getTocForPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'Our Mission - AWFixer Party',
  description: 'Our mission is to build a better community through transparency and engagement.',
  ...ogMetadata('Our Mission - AWFixer Party', {
    description: 'Our mission is to build a better community through transparency and engagement.',
  }),
};

export default async function MissionPage() {
  const cmsPage = await getPageByPathServer('/about/mission');
  const tocItems = await getTocForPathServer('/about/mission');
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
      title="Our Mission"
      description="Building a community that works for everyone."
      items={tocItems}
    >
      <p>
        Our mission is to create a political organization that truly represents the people it
        serves. We believe that when community members are informed and engaged, better decisions
        get made.
      </p>

      <h2 id="what-were-working-toward">What We&apos;re Working Toward</h2>
      <ul>
        <li>
          <strong>A More Transparent Government:</strong> Where decisions are made openly and with
          public input
        </li>
        <li>
          <strong>Stronger Privacy Protections:</strong> Ensuring individuals have control over
          their data
        </li>
        <li>
          <strong>Community-Driven Solutions:</strong> Putting public interest ahead of special
          interests
        </li>
        <li>
          <strong>Greater Civic Engagement:</strong> Making it easier for everyone to participate in
          democracy
        </li>
      </ul>

      <h2 id="how-we-get-there">How We Get There</h2>
      <p>
        We pursue our mission through community organizing, public education, and direct advocacy.
        We believe in working with anyone who shares our vision, regardless of party affiliation.
      </p>

      <h2 id="join-us">Join Us</h2>
      <p>
        This mission can only be achieved with an engaged community. Your voice matters. Get
        involved today.
      </p>
    </InfoPageLayout>
  );
}
