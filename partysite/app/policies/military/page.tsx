import { Metadata } from 'next';
import Link from 'next/link';

import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import { getPageByPathServer, getTocForPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { MILITARY_POLICY_SECTIONS, POLICY_PARENTS } from '@/lib/policy-navigation';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'Military policies - AWFixer Party',
  description:
    'Military-related policy areas: branches, politics, war policy, and nuclear material management.',
  ...ogMetadata('Military policies - AWFixer Party', {
    description:
      'Military policy topics for AWFixer Party: branches, civil–military relations, war policy, nuclear stewardship.',
  }),
};

export default async function MilitaryPoliciesHubPage() {
  const cmsPage = await getPageByPathServer('/policies/military');
  const tocItems = await getTocForPathServer('/policies/military');
  const { path, label } = POLICY_PARENTS.military;
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
      description="Dedicated military policy subsections."
      backHref="/policies"
      backLabel="Back to Policies"
      items={tocItems}
    >
      <p>
        Military policy is organized into four subsections below. These are distinct from the eight
        general topic areas used under State and Region / Circuit.
      </p>

      <h2 id="subsections">Subsections</h2>
      <ul className="flex flex-col gap-2">
        {MILITARY_POLICY_SECTIONS.map((s) => (
          <li key={s.slug}>
            <Link href={`${path}/${s.slug}`} className="text-primary underline hover:no-underline">
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </InfoPageLayout>
  );
}
