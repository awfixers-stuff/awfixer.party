'use client';

import { ContentAdminEditButton } from '@/components/admin/content-admin-edit-button';

/**
 * Fixed admin affordance for CMS-backed legal pages (TipTap body from Convex). Shell content is
 * a placeholder until the admin content system is wired.
 */
export function LegalSlugEditButton({ path }: { path: string }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
      <div className="pointer-events-auto shadow-md">
        <ContentAdminEditButton request={{ mode: 'sitePage', payload: { path } }} />
      </div>
    </div>
  );
}
