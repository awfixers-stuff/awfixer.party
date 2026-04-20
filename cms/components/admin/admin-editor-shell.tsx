'use client';

import * as React from 'react';

import type {
  EditorShellOpenRequest,
  EditorShellState,
} from '@/components/admin/admin-editor-shell-types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type AdminEditorShellContextValue = {
  state: EditorShellState;
  openShell: (request: EditorShellOpenRequest) => void;
  closeShell: () => void;
};

const AdminEditorShellContext = React.createContext<AdminEditorShellContextValue | null>(null);

export function useAdminEditorShell(): AdminEditorShellContextValue {
  const ctx = React.useContext(AdminEditorShellContext);
  if (!ctx) {
    throw new Error('useAdminEditorShell must be used within AdminEditorShellProvider');
  }
  return ctx;
}

function shellTitle(state: EditorShellOpenRequest): string {
  switch (state.mode) {
    case 'sitePage':
      return 'Edit page';
    case 'newsletter':
      return 'Newsletter';
    case 'helpOutForm':
      return 'Help out form';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function shellDescription(state: EditorShellOpenRequest): string {
  switch (state.mode) {
    case 'sitePage':
      return `Draft editing for ${state.payload.path}`;
    case 'newsletter':
      return 'Footer newsletter widget';
    case 'helpOutForm':
      return `Form for role ${state.payload.roleSlug}`;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function AdminEditorShellProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<EditorShellState>(null);

  const openShell = React.useCallback((request: EditorShellOpenRequest) => {
    setState(request);
  }, []);

  const closeShell = React.useCallback(() => {
    setState(null);
  }, []);

  const value = React.useMemo(
    () => ({ state, openShell, closeShell }),
    [state, openShell, closeShell],
  );

  const open = Boolean(state);

  return (
    <AdminEditorShellContext.Provider value={value}>
      {children}
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) closeShell();
        }}
      >
        <SheetContent
          side="right"
          showCloseButton
          className={cn(
            'w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl lg:max-w-[min(100vw-2rem,42rem)]',
          )}
        >
          {state && (
            <>
              <SheetHeader className="border-b border-border px-6 py-4 pr-14">
                <SheetTitle>{shellTitle(state)}</SheetTitle>
                <SheetDescription>{shellDescription(state)}</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 px-6 py-4">
                <React.Suspense
                  fallback={
                    <div className="text-sm text-muted-foreground">Loading editor…</div>
                  }
                >
                  <LazyShellBodies state={state} />
                </React.Suspense>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminEditorShellContext.Provider>
  );
}

const LazyShellBodies = React.lazy(async () => {
  const mod = await import('@/components/admin/admin-editor-shell-bodies');
  return { default: mod.AdminEditorShellBodies };
});
