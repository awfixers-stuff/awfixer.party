import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PolicyPageLayout } from '@/components/policy-page';
import { ogMetadata } from '@/lib/og';
import { POLICY_LEAF_TOC_ITEMS } from '@/lib/policy-leaf-toc';
import { POLICY_PARENTS, SHARED_POLICY_SECTIONS, getSharedSection } from '@/lib/policy-navigation';

import { PolicyLeafBody } from '../../_components/policy-leaf-body';

export function generateStaticParams() {
  return SHARED_POLICY_SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = getSharedSection(slug);
  if (!section) {
    return {};
  }
  const title = `${section.title} (State) - AWFixer Party`;
  return {
    title,
    description: `State policy area: ${section.title}.`,
    ...ogMetadata(title, {
      description: `AWFixer Party state-level policy on ${section.title}.`,
    }),
  };
}

export default async function StatePolicySectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSharedSection(slug);
  if (!section) {
    notFound();
  }

  const parent = POLICY_PARENTS.state;

  return (
    <PolicyPageLayout
      title={`${section.title} (${parent.shortLabel})`}
      description={`State-level policy area: ${section.title}.`}
      backHref={parent.path}
      backLabel="Back to State policies"
      items={POLICY_LEAF_TOC_ITEMS}
    >
      <PolicyLeafBody sectionTitle={section.title} parentLabel={parent.label} />
      <div className="mt-8 flex flex-col gap-2 text-sm text-muted-foreground">
        <Link href={parent.path} className="text-primary underline hover:no-underline">
          All state topic areas
        </Link>
        <Link
          href={POLICY_PARENTS['region-circuit'].path}
          className="text-primary underline hover:no-underline"
        >
          Region / Circuit (same eight topics)
        </Link>
      </div>
    </PolicyPageLayout>
  );
}
