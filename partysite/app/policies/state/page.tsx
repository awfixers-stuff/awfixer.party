import { Metadata } from 'next';
import Link from 'next/link';

import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import { getPageByPathServer, getTocForPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { POLICY_PARENTS, SHARED_POLICY_SECTIONS } from '@/lib/policy-navigation';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'State policies - AWFixer Party',
  description: 'State-level policy areas: judicial rules, budgeting, immigration, and more.',
  ...ogMetadata('State policies - AWFixer Party', {
    description: 'State-level policy areas for AWFixer Party: eight topic sections.',
  }),
};

export default async function StatePoliciesHubPage() {
  const cmsPage = await getPageByPathServer('/policies/state');
  const tocItems = await getTocForPathServer('/policies/state');
  const { path, label } = POLICY_PARENTS.state;
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
      description="Eight policy topic areas at the state level."
      backHref="/policies"
      backLabel="Back to Policies"
      items={tocItems}
    >
      <p>
        Explore each topic below. These mirror the same eight areas under Region / Circuit, scoped
        for state-level governance and organizing.
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
          href={POLICY_PARENTS['region-circuit'].path}
          className="text-primary underline hover:no-underline"
        >
          Region / Circuit policies
        </Link>{' '}
        — same eight topics, circuit and regional context.
      </p>
    </InfoPageLayout>
  );
}
