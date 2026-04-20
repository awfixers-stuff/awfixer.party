/**
 * Placeholder bodies for the admin editor shell. Replace with real editors when the admin CMS
 * is wired (RichTextEditor + sitePages mutations, NewsletterAdminClient, help-out form builder).
 */
import Link from 'next/link';
import type { ReactNode } from 'react';

import type { EditorShellOpenRequest } from '@/components/admin/admin-editor-shell-types';

function PlaceholderFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 p-1">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="rounded-md border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function AdminEditorShellBodies({ state }: { state: EditorShellOpenRequest }) {
  switch (state.mode) {
    case 'sitePage':
      return (
        <PlaceholderFrame title="Site page editor">
          <p>
            Path: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{state.payload.path}</code>
          </p>
          <p className="mt-3">
            Full TipTap editing and save will connect here when the admin content system is ready.
          </p>
        </PlaceholderFrame>
      );
    case 'newsletter':
      return (
        <PlaceholderFrame title="Newsletter widget">
          <p>Configure the footer newsletter embed and copy from this shell once CMS hooks exist.</p>
          <p className="mt-3">
            <Link
              href="/admin/newsletter"
              className="text-primary underline hover:no-underline"
            >
              Open full admin newsletter page
            </Link>
          </p>
        </PlaceholderFrame>
      );
    case 'helpOutForm':
      return (
        <PlaceholderFrame title="Help out form editor">
          <p>
            Role:{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{state.payload.roleSlug}</code>
          </p>
          <p className="mt-3">
            Form builder UI will load here when the admin content system supports help-out forms.
          </p>
          <p className="mt-3">
            <Link href="/admin/submissions" className="text-primary underline hover:no-underline">
              View submissions in admin
            </Link>
          </p>
        </PlaceholderFrame>
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
