/**
 * Policy area hierarchy: State & Region/Circuit share eight topic areas;
 * Military uses four dedicated subsections.
 */

export const SHARED_POLICY_SECTIONS = [
  { slug: 'judicial-rules', title: 'Judicial Rules' },
  { slug: 'budgeting', title: 'Budgeting' },
  { slug: 'immigration', title: 'Immigration' },
  { slug: 'employment', title: 'Employment' },
  { slug: 'economy', title: 'Economy' },
  { slug: 'technology', title: 'Technology' },
  { slug: 'policy-reception', title: 'Policy Reception' },
  { slug: 'law-enforcement', title: 'Law Enforcement' },
] as const;

export const MILITARY_POLICY_SECTIONS = [
  { slug: 'branches', title: 'Branches' },
  { slug: 'military-in-politics', title: 'Military in Politics' },
  { slug: 'war-policies', title: 'War Policies' },
  { slug: 'nuclear-material-management', title: 'Nuclear Material Management' },
] as const;

export type PolicyParentId = 'state' | 'region-circuit' | 'military';

export const POLICY_PARENTS: Record<
  PolicyParentId,
  { path: string; label: string; shortLabel: string }
> = {
  state: {
    path: '/policies/state',
    label: 'State',
    shortLabel: 'State',
  },
  'region-circuit': {
    path: '/policies/region-circuit',
    label: 'Region / Circuit',
    shortLabel: 'Region / Circuit',
  },
  military: {
    path: '/policies/military',
    label: 'Military',
    shortLabel: 'Military',
  },
};

export function getSharedSection(slug: string) {
  return SHARED_POLICY_SECTIONS.find((s) => s.slug === slug);
}

export function getMilitarySection(slug: string) {
  return MILITARY_POLICY_SECTIONS.find((s) => s.slug === slug);
}

/** Every static policy URL under `/policies` (for sitemap). */
export function getAllPolicyPathnames(): string[] {
  const paths = ['/policies/state', '/policies/region-circuit', '/policies/military'];
  for (const s of SHARED_POLICY_SECTIONS) {
    paths.push(`/policies/state/${s.slug}`);
    paths.push(`/policies/region-circuit/${s.slug}`);
  }
  for (const s of MILITARY_POLICY_SECTIONS) {
    paths.push(`/policies/military/${s.slug}`);
  }
  return paths;
}
