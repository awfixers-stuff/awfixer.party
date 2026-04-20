'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { getSessionId, sendTrack } from '@/lib/analytics';

const SCROLL_MILESTONES = [25, 50, 75, 100];

export function usePageTracking() {
  const pathname = usePathname();
  const entryTimeRef = useRef(Date.now());
  const currentPathRef = useRef(pathname);
  const scrollMilestonesRef = useRef(new Set<number>());
  const maxScrollRef = useRef(0);

  const sendExitEvent = useCallback((exitPath: string) => {
    const duration = Math.round((Date.now() - entryTimeRef.current) / 1000);
    if (duration < 1) return;
    sendTrack({
      type: 'event',
      path: exitPath,
      sessionId: getSessionId(),
      name: 'page_exit',
      props: { duration, max_scroll: maxScrollRef.current },
    });
  }, []);

  // Pageview + send exit for previous page on SPA navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sessionId = getSessionId();

    if (currentPathRef.current !== pathname) {
      sendExitEvent(currentPathRef.current);
    }

    currentPathRef.current = pathname;
    sendTrack({
      type: 'pageview',
      path: pathname,
      sessionId,
      referrer: document.referrer || undefined,
    });
    entryTimeRef.current = Date.now();
    scrollMilestonesRef.current = new Set();
    maxScrollRef.current = 0;
  }, [pathname, sendExitEvent]);

  // Scroll depth milestones
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;

      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !scrollMilestonesRef.current.has(milestone)) {
          scrollMilestonesRef.current.add(milestone);
          sendTrack({
            type: 'event',
            path: pathname,
            sessionId: getSessionId(),
            name: 'scroll_depth',
            props: { depth: milestone },
          });
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Exit on tab hide / window close
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sendExitEvent(currentPathRef.current);
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [sendExitEvent]);
}
