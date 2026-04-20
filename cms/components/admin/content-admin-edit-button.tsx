'use client';

import { useAdminEditorShell } from '@/components/admin/admin-editor-shell';
import { useIsActiveOrgAdmin } from '@/components/admin/admin-allowlist-provider';
import type { EditorShellOpenRequest } from '@/components/admin/admin-editor-shell-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

export function ContentAdminEditButton({
  request,
  label = 'Edit',
  className,
  variant = 'secondary',
  size = 'sm',
  ...buttonProps
}: {
  request: EditorShellOpenRequest;
  label?: string;
} & Omit<ButtonProps, 'onClick' | 'children'>) {
  const { isAdmin, isReady } = useIsActiveOrgAdmin();
  const { openShell } = useAdminEditorShell();

  if (!isReady || !isAdmin) {
    return null;
  }

  return (
    <Button
      type="button"
      onClick={() => openShell(request)}
      {...buttonProps}
      variant={variant}
      size={size}
      className={cn(className, buttonProps.className)}
    >
      {label}
    </Button>
  );
}
