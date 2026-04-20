'use client';

import type { ReactNode } from 'react';

import { usePageTracking } from '@/hooks/use-page-tracking';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}
