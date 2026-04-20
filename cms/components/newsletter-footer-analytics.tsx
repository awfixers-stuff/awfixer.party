'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { useAnalytics } from '@/hooks/use-analytics';

export function NewsletterViewRoot({ children }: { children: ReactNode }) {
  const { track } = useAnalytics();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit || viewTracked.current) return;
        viewTracked.current = true;
        track('newsletter_section_view');
        obs.disconnect();
      },
      { root: null, rootMargin: '0px', threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [track]);

  return (
    <div ref={rootRef} className="rounded-xl border bg-muted/30 p-6 lg:p-8">
      {children}
    </div>
  );
}

export function NewsletterSubscribeAnchor({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const { track } = useAnalytics();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-block text-primary underline hover:no-underline"
      onClick={() => track('newsletter_subscribe_click', { href })}
    >
      {children}
    </a>
  );
}
