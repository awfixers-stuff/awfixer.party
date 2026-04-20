'use client';

import { TableOfContents } from '@/components/toc';
import type { TOCItem } from '@/lib/toc';

export function TocAside({ items }: { items: TOCItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside className="hidden w-64 lg:block">
      <div className="sticky top-20">
        <TableOfContents items={items} />
      </div>
    </aside>
  );
}
