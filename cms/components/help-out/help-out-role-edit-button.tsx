'use client';

import { ContentAdminEditButton } from '@/components/admin/content-admin-edit-button';

export function HelpOutRoleEditButton({ roleSlug }: { roleSlug: string }) {
  return (
    <div className="mb-6 flex justify-end">
      <ContentAdminEditButton
        request={{ mode: 'helpOutForm', payload: { roleSlug } }}
        label="Edit form in shell"
        variant="outline"
      />
    </div>
  );
}
