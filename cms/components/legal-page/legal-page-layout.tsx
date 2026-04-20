import { TocAside } from '@/components/toc/toc-aside';
import type { TOCItem } from '@/lib/toc';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  items: TOCItem[];
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, items, children }: LegalPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 md:flex-row lg:px-10 xl:px-12">
      <article className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          {lastUpdated && (
            <p className="mt-2 text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
          )}
        </div>
        <div className="prose prose-neutral dark:prose-invert max-w-none">{children}</div>
      </article>
      <TocAside items={items} />
    </div>
  );
}

export function generateLegalTOC(items: TOCItem[]): TOCItem[] {
  return items;
}
