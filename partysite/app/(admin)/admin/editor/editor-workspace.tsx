'use client';

import type { JSONContent } from '@tiptap/core';
import { useMutation, useQuery } from 'convex/react';
import { AlertTriangle, FilePlus, Loader2, Trash2 } from 'lucide-react';
import * as React from 'react';
import type { ChangeEvent } from 'react';

import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';

const SECTION_KEYS = ['legal', 'about', 'policies', 'help-out', 'home', 'custom'];

type NewPageForm = {
  path: string;
  title: string;
  sectionKey: string;
};

function NewPageDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (form: NewPageForm) => void;
}) {
  const [form, setForm] = React.useState<NewPageForm>({
    path: '/',
    title: '',
    sectionKey: 'custom',
  });

  React.useEffect(() => {
    if (open) setForm({ path: '/', title: '', sectionKey: 'custom' });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create new page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Path</Label>
            <Input
              value={form.path}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, path: e.target.value }))}
              placeholder="/about/new-page"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Page title"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Section</Label>
            <Select
              value={form.sectionKey}
              onValueChange={(v: string) => setForm((f) => ({ ...f, sectionKey: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!form.path.startsWith('/') || !form.title.trim()}
            onClick={() => onCreate(form)}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  path,
  onClose,
  onConfirm,
}: {
  open: boolean;
  path: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            Delete page
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-mono text-foreground">{path}</span>?
          This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type PageMeta = {
  title: string;
  description: string;
  sectionKey: string;
  lastUpdatedLabel: string;
  status: 'draft' | 'published';
  path: string;
};

function EditorPanel({ selectedPath }: { selectedPath: string }) {
  const page = useQuery(api.sitePages.getPageByPathAdmin, { path: selectedPath });
  const upsertPage = useMutation(api.sitePages.upsertPage);
  const deletePage = useMutation(api.sitePages.deletePage);

  const [meta, setMeta] = React.useState<PageMeta>({
    title: '',
    description: '',
    sectionKey: 'custom',
    lastUpdatedLabel: '',
    status: 'draft',
    path: selectedPath,
  });
  const [bodyJson, setBodyJson] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  // Sync meta/body from loaded page
  React.useEffect(() => {
    if (page === undefined) return;
    if (page === null) {
      setMeta((m) => ({
        title: '',
        description: '',
        sectionKey: 'custom',
        lastUpdatedLabel: '',
        status: 'draft',
        path: selectedPath,
      }));
      setBodyJson(null);
      return;
    }
    setMeta({
      title: page.title,
      description: page.description ?? '',
      sectionKey: page.sectionKey,
      lastUpdatedLabel: page.lastUpdatedLabel ?? '',
      status: page.status,
      path: page.path,
    });
    setBodyJson(page.bodyJson ?? null);
  }, [page, selectedPath]);

  const handleSave = async (overrideStatus?: 'draft' | 'published') => {
    setSaving(true);
    try {
      await upsertPage({
        path: meta.path,
        title: meta.title,
        description: meta.description || undefined,
        sectionKey: meta.sectionKey,
        lastUpdatedLabel: meta.lastUpdatedLabel || undefined,
        status: overrideStatus ?? meta.status,
        bodyJson: bodyJson ?? undefined,
      });
      if (overrideStatus) setMeta((m) => ({ ...m, status: overrideStatus }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deletePage({ path: meta.path });
    setDeleted(true);
    setShowDelete(false);
  };

  const initialContent = React.useMemo(() => {
    if (!bodyJson) return null;
    try {
      return JSON.parse(bodyJson) as JSONContent;
    } catch {
      return null;
    }
  }, [bodyJson]);

  if (page === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Page deleted. Select another page from the sidebar.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Metadata bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Path</Label>
          <Input
            value={meta.path}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMeta((m) => ({ ...m, path: e.target.value }))}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Title</Label>
          <Input
            value={meta.title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMeta((m) => ({ ...m, title: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Section</Label>
          <Select
            value={meta.sectionKey}
            onValueChange={(v: string) => setMeta((m) => ({ ...m, sectionKey: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTION_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Description</Label>
          <Textarea
            value={meta.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMeta((m) => ({ ...m, description: e.target.value }))}
            rows={2}
            className="resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Last Updated Label</Label>
          <Input
            value={meta.lastUpdatedLabel}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMeta((m) => ({ ...m, lastUpdatedLabel: e.target.value }))}
            placeholder="e.g. January 2025"
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap border-b pb-4">
        <Badge variant={meta.status === 'published' ? 'default' : 'secondary'}>
          {meta.status}
        </Badge>
        <Button size="sm" onClick={() => handleSave()} disabled={saving}>
          {saving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
          {saved ? 'Saved!' : 'Save'}
        </Button>
        {meta.status === 'draft' ? (
          <Button size="sm" variant="outline" onClick={() => handleSave('published')} disabled={saving}>
            Publish
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            Unpublish
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive ml-auto"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="size-3.5 mr-1.5" />
          Delete
        </Button>
      </div>

      {/* TipTap editor keyed by selectedPath so it remounts on page change */}
      <RichTextEditor
        key={selectedPath}
        preset="article"
        initialContent={initialContent}
        onChange={(json) => setBodyJson(JSON.stringify(json))}
        placeholder="Start writing page content here..."
      />

      <DeleteDialog
        open={showDelete}
        path={meta.path}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function EditorWorkspace() {
  const allPages = useQuery(api.sitePages.listAllPaths);
  const upsertPage = useMutation(api.sitePages.upsertPage);

  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = React.useState(false);

  // Group pages by section
  const grouped = React.useMemo(() => {
    if (!allPages) return {};
    return allPages.reduce<Record<string, typeof allPages>>((acc, p) => {
      const k = p.sectionKey ?? 'custom';
      if (!acc[k]) acc[k] = [];
      acc[k].push(p);
      return acc;
    }, {});
  }, [allPages]);

  const handleCreate = async (form: NewPageForm) => {
    await upsertPage({
      path: form.path,
      title: form.title,
      sectionKey: form.sectionKey,
      status: 'draft',
    });
    setShowNewDialog(false);
    setSelectedPath(form.path);
  };

  return (
    <div className="flex gap-0 border rounded-lg overflow-hidden min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r flex flex-col bg-muted/20">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Pages
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={() => setShowNewDialog(true)}
            title="New page"
          >
            <FilePlus className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {allPages === undefined ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : allPages.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No pages yet. Create one above.</p>
          ) : (
            Object.entries(grouped).map(([section, pages]) => (
              <div key={section}>
                <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {section}
                </p>
                {pages.map((p) => (
                  <button
                    key={p.path}
                    type="button"
                    onClick={() => setSelectedPath(p.path)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center justify-between gap-2',
                      selectedPath === p.path
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-foreground',
                    )}
                  >
                    <span className="truncate font-mono text-xs">{p.path}</span>
                    <span
                      className={cn(
                        'shrink-0 text-[10px] font-semibold rounded px-1',
                        p.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {p.status === 'published' ? 'live' : 'draft'}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Editor panel */}
      <main className="flex-1 p-4 overflow-auto">
        {selectedPath ? (
          <EditorPanel selectedPath={selectedPath} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <p className="text-sm">Select a page from the sidebar to edit</p>
            <p className="text-xs">or</p>
            <Button size="sm" variant="outline" onClick={() => setShowNewDialog(true)}>
              <FilePlus className="size-3.5 mr-1.5" />
              Create new page
            </Button>
          </div>
        )}
      </main>

      <NewPageDialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
