import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PolicyPageLayout } from '@/components/policy-page';
import { ogMetadata } from '@/lib/og';
import { POLICY_LEAF_TOC_ITEMS } from '@/lib/policy-leaf-toc';
import {
  MILITARY_POLICY_SECTIONS,
  POLICY_PARENTS,
  getMilitarySection,
} from '@/lib/policy-navigation';

import { PolicyLeafBody } from '../../_components/policy-leaf-body';

export function generateStaticParams() {
  return MILITARY_POLICY_SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = getMilitarySection(slug);
  if (!section) {
    return {};
  }
  const title = `${section.title} (Military) - AWFixer Party`;
  return {
    title,
    description: `Military policy area: ${section.title}.`,
    ...ogMetadata(title, {
      description: `AWFixer Party military policy on ${section.title}.`,
    }),
  };
}

export default async function MilitaryPolicySectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getMilitarySection(slug);
  if (!section) {
    notFound();
  }

  const parent = POLICY_PARENTS.military;

  return (
    <PolicyPageLayout
      title={`${section.title} (${parent.shortLabel})`}
      description={`Military policy area: ${section.title}.`}
      backHref={parent.path}
      backLabel="Back to Military policies"
      items={POLICY_LEAF_TOC_ITEMS}
    >
      <PolicyLeafBody sectionTitle={section.title} parentLabel={parent.label} />
      <div className="mt-8">
        <Link href={parent.path} className="text-sm text-primary underline hover:no-underline">
          All military subsections
        </Link>
      </div>
    </PolicyPageLayout>
  );
}
