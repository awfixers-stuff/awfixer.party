'use client';

import { ContentAdminEditButton } from '@/components/admin/content-admin-edit-button';

/** Stub entry to open the newsletter admin shell from the public footer (active-org admins only). */
export function NewsletterFooterAdminEdit() {
  return (
    <div className="flex justify-end">
      <ContentAdminEditButton
        request={{ mode: 'newsletter', payload: { section: 'footer' } }}
        label="Edit newsletter widget"
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs text-muted-foreground"
      />
    </div>
  );
}
