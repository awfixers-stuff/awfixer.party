'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { flattenTocIds, nestTocItems, type TOCItem, type TOCNode } from '@/lib/toc';
import { cn } from '@/lib/utils';

export type { TOCItem };

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

function TocBranch({
  nodes,
  activeId,
  depth,
  onNavigate,
}: {
  nodes: TOCNode[];
  activeId: string;
  depth: number;
  onNavigate: (id: string) => void;
}) {
  return (
    <ul className={cn('space-y-0.5', depth > 0 && 'mt-1 border-l border-border pl-3')}>
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            onClick={() => onNavigate(node.id)}
            className={cn(
              'block w-full rounded-md py-1 text-left text-sm transition-colors hover:text-foreground/80',
              depth === 0 && 'font-medium',
              activeId === node.id ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {node.title}
          </button>
          {node.children.length > 0 ? (
            <TocBranch
              nodes={node.children}
              activeId={activeId}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const tree = useMemo(() => nestTocItems(items), [items]);
  const allIds = useMemo(() => flattenTocIds(tree), [tree]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' },
    );

    allIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [allIds]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className={cn('sticky top-20 flex flex-col gap-1', className)}>
      <div className="mb-2 text-sm font-medium">On this page</div>
      <TocBranch nodes={tree} activeId={activeId} depth={0} onNavigate={scrollToSection} />
    </nav>
  );
}
