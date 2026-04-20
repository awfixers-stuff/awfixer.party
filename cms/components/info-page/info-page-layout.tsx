import Link from 'next/link';

import { TocAside } from '@/components/toc/toc-aside';
import type { TOCItem } from '@/lib/toc';

interface InfoPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  items?: TOCItem[];
}

export function InfoPageLayout({
  title,
  description,
  children,
  backHref = '/about',
  backLabel = 'Back to About',
  items,
}: InfoPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 md:flex-row lg:px-10 xl:px-12">
      <article className="flex-1">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; {backLabel}
          </Link>
        )}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="mt-2 text-lg text-muted-foreground">{description}</p>}
        </div>
        <div className="prose prose-neutral dark:prose-invert max-w-none">{children}</div>
      </article>
      {items && items.length > 0 ? <TocAside items={items} /> : null}
    </div>
  );
}
