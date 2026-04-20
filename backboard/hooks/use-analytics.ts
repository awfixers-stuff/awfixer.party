'use client';

import { usePathname } from 'next/navigation';

import { getSessionId, sendTrack } from '@/lib/analytics';

export function useAnalytics() {
  const pathname = usePathname();

  function track(name: string, props?: Record<string, unknown>) {
    if (typeof window === 'undefined') return;
    sendTrack({
      type: 'event',
      path: pathname,
      sessionId: getSessionId(),
      name,
      props,
    });
  }

  return { track };
}
