import type { TOCItem } from '@/lib/toc';

/** Matches headings in `PolicyLeafBody` (policy subsection placeholder pages). */
export const POLICY_LEAF_TOC_ITEMS: TOCItem[] = [
  { id: 'overview', title: 'Overview', level: 2 },
  { id: 'scope', title: 'Scope', level: 2 },
  { id: 'principles', title: 'Principles', level: 2 },
  { id: 'next-steps', title: 'Next steps', level: 2 },
];
