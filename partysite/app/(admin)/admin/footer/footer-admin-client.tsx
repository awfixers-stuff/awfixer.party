'use client';

import { useMutation, useQuery } from 'convex/react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import type { ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/convex/_generated/api';

type NavLink = { href: string; label: string };

type FooterColumn = {
  id: string;
  heading: string;
  links: NavLink[];
};

function LinkListEditor({
  links,
  onChange,
}: {
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
}) {
  const add = () => onChange([...links, { href: '', label: '' }]);
  const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof NavLink, value: string) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            value={link.label}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, 'label', e.target.value)}
            placeholder="Label"
            className="flex-1"
          />
          <Input
            value={link.href}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, 'href', e.target.value)}
            placeholder="/path or https://…"
            className="flex-1 font-mono text-sm"
          />
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 text-destructive hover:text-destructive"
            onClick={() => remove(i)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={add} className="w-full">
        <Plus className="size-3.5 mr-1.5" />
        Add link
      </Button>
    </div>
  );
}

function ColumnEditor({
  column,
  onChange,
  onRemove,
}: {
  column: FooterColumn;
  onChange: (c: FooterColumn) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/10">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Column heading</Label>
          <Input
            value={column.heading}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...column, heading: e.target.value })}
            placeholder="e.g. About"
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="mt-5 text-destructive hover:text-destructive shrink-0"
          onClick={onRemove}
          title="Remove column"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Links</Label>
        <LinkListEditor
          links={column.links}
          onChange={(links) => onChange({ ...column, links })}
        />
      </div>
    </div>
  );
}

export function FooterAdminClient() {
  const chrome = useQuery(api.siteChrome.getSiteChrome);
  const updateFooter = useMutation(api.siteChrome.updateFooter);

  const [brandName, setBrandName] = React.useState('');
  const [tagline, setTagline] = React.useState('');
  const [copyright, setCopyright] = React.useState('');
  const [columns, setColumns] = React.useState<FooterColumn[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [seeded, setSeeded] = React.useState(false);

  React.useEffect(() => {
    if (!chrome || seeded) return;
    setBrandName(chrome.footerBrandName);
    setTagline(chrome.footerTagline);
    setCopyright(chrome.copyrightText);
    setColumns(chrome.footerColumns as FooterColumn[]);
    setSeeded(true);
  }, [chrome, seeded]);

  const addColumn = () => {
    if (columns.length >= 3) return;
    setColumns((c) => [
      ...c,
      { id: `col-${Date.now()}`, heading: 'New Column', links: [] },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFooter({
        footerBrandName: brandName,
        footerTagline: tagline,
        footerColumns: columns,
        copyrightText: copyright,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!chrome || !seeded) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-4">
        <Loader2 className="size-4 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Brand section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Brand</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Brand name</Label>
            <Input
              value={brandName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBrandName(e.target.value)}
              placeholder="AWFixer Party"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tagline</Label>
            <Input
              value={tagline}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTagline(e.target.value)}
              placeholder="Independent. Transparent. Community-driven."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Copyright text</Label>
            <Input
              value={copyright}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCopyright(e.target.value)}
              placeholder="AWFixer Party. All rights reserved."
            />
          </div>
        </div>
      </section>

      {/* Columns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Footer columns</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={addColumn}
            disabled={columns.length >= 3}
          >
            <Plus className="size-3.5 mr-1.5" />
            Add column
          </Button>
        </div>
        <div className="space-y-4">
          {columns.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No columns yet. Add up to 3 footer link columns.
            </p>
          )}
          {columns.map((col, i) => (
            <ColumnEditor
              key={col.id}
              column={col}
              onChange={(c) => setColumns((cs) => cs.map((oc, idx) => (idx === i ? c : oc)))}
              onRemove={() => setColumns((cs) => cs.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="border-t pt-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          {saved ? 'Saved!' : 'Save footer'}
        </Button>
        <p className="text-xs text-muted-foreground">Changes apply to all visitors immediately.</p>
      </div>
    </div>
  );
}
