import { InfoPageLayout } from '@/components/info-page/info-page-layout';
import type { TOCItem } from '@/lib/toc';

interface PolicyPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  items?: TOCItem[];
  /** Defaults to the policies overview. Use a parent hub path for subsection pages. */
  backHref?: string;
  backLabel?: string;
}

/**
 * Same structure as info pages, with defaults for the Policies hub.
 * Add new routes under `app/policies/…` and point the nav in `site-navigation.ts`.
 */
export function PolicyPageLayout({
  title,
  description,
  children,
  items,
  backHref = '/policies',
  backLabel = 'Back to Policies',
}: PolicyPageLayoutProps) {
  return (
    <InfoPageLayout
      title={title}
      description={description}
      backHref={backHref}
      backLabel={backLabel}
      items={items}
    >
      {children}
    </InfoPageLayout>
  );
}
