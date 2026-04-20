'use client';

import { useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import type { ReactNode } from 'react';

function getConvexUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const convexUrl = getConvexUrl();

const convex = convexUrl !== undefined ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing NEXT_PUBLIC_CONVEX_URL. Set it in the environment and redeploy so the Convex client is available.',
      );
    }
    return <>{children}</>;
  }
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
