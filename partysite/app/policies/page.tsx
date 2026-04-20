import { Metadata } from 'next';
import Link from 'next/link';

import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import { getPageByPathServer, getTocForPathServer } from '@/lib/convex-server';
import { ogMetadata } from '@/lib/og';
import { POLICY_PARENTS } from '@/lib/policy-navigation';
import { tiptapJsonStringToHtml } from '@/lib/tiptap-public-html';

export const metadata: Metadata = {
  title: 'Policies - AWFixer Party',
  description: 'Official policies and guidelines for AWFixer Party.',
  ...ogMetadata('Policies - AWFixer Party', {
    description: 'Official policies and guidelines for AWFixer Party.',
  }),
};

export default async function PoliciesPage() {
  const cmsPage = await getPageByPathServer('/policies');
  const tocItems = await getTocForPathServer('/policies');
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
  const state = POLICY_PARENTS.state;
  const region = POLICY_PARENTS['region-circuit'];
  const military = POLICY_PARENTS.military;

  return (
    <InfoPageLayout
      title="Policies"
      description="Guidelines and standards we publish as they evolve."
      backHref=""
      items={tocItems}
    >
      <p>
        Policies are grouped into three parent areas. State and Region / Circuit each include the
        same eight topic sections. Military uses four dedicated subsections on defense and security
        matters.
      </p>

      <h2 id="state">State</h2>
      <p>
        Eight topic areas at the state level: judicial rules, budgeting, immigration, employment,
        economy, technology, policy reception, and law enforcement.
      </p>
      <p>
        <Link href={state.path} className="text-primary underline hover:no-underline">
          Browse State policies
        </Link>
      </p>

      <h2 id="region-circuit">Region / Circuit</h2>
      <p>The same eight topics as State, framed for regional and circuit organizing.</p>
      <p>
        <Link href={region.path} className="text-primary underline hover:no-underline">
          Browse Region / Circuit policies
        </Link>
      </p>

      <h2 id="military">Military</h2>
      <p>
        Four subsections: branches, military in politics, war policies, and nuclear material
        management.
      </p>
      <p>
        <Link href={military.path} className="text-primary underline hover:no-underline">
          Browse Military policies
        </Link>
      </p>

      <h2 id="how-to-read-these-documents">How to Read These Documents</h2>
      <p>
        Policies use clear headings; deeper levels appear in the table of contents on each page.
      </p>

      <h2 id="updates">Updates</h2>
      <p>
        When a policy changes, we adjust the &quot;Last updated&quot; line on that page and
        summarize material edits when appropriate.
      </p>
    </InfoPageLayout>
  );
}
