import type { ReactNode } from 'react';

export function EditorShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CMS Editor</h1>
        <p className="text-muted-foreground text-sm">
          Manage site page content — select a page to edit or create a new one.
        </p>
      </div>
      {children}
    </div>
  );
}
