import { Metadata } from 'next';
import Link from 'next/link';

import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import { getPageByPathServer, getTocForPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { POLICY_PARENTS, SHARED_POLICY_SECTIONS } from '@/lib/policy-navigation';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'Region / Circuit policies - AWFixer Party',
  description:
    'Regional and circuit-level policy areas: eight topics aligned with state and national organizing.',
  ...ogMetadata('Region / Circuit policies - AWFixer Party', {
    description: 'Region and circuit policy topics for AWFixer Party: eight sections.',
  }),
};

export default async function RegionCircuitPoliciesHubPage() {
  const cmsPage = await getPageByPathServer('/policies/region-circuit');
  const tocItems = await getTocForPathServer('/policies/region-circuit');
  const { path, label } = POLICY_PARENTS['region-circuit'];
  if (cmsPage?.bodyJson) {
    const html = tiptapJsonStringToHtml(cmsPage.bodyJson);
    return (
      <InfoPageLayout
        title={cmsPage.title}
        description={cmsPage.description}
        backHref="/policies"
        backLabel="Back to Policies"
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
      title={`${label} policies`}
      description="Eight policy topic areas for regional and circuit work."
      backHref="/policies"
      backLabel="Back to Policies"
      items={tocItems}
    >
      <p>
        These topics mirror the state-level list, scoped for regional and circuit organizing,
        coalition work, and distributed leadership.
      </p>

      <h2 id="topic-areas">Topic areas</h2>
      <ul className="flex flex-col gap-2">
        {SHARED_POLICY_SECTIONS.map((s) => (
          <li key={s.slug}>
            <Link href={`${path}/${s.slug}`} className="text-primary underline hover:no-underline">
              {s.title}
            </Link>
          </li>
        ))}
      </ul>

      <h2 id="related">Related</h2>
      <p>
        <Link
          href={POLICY_PARENTS.state.path}
          className="text-primary underline hover:no-underline"
        >
          State policies
        </Link>{' '}
        — same eight topics with a state-level framing.
      </p>
    </InfoPageLayout>
  );
}
