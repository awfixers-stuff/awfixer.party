'use client';

import { useMutation, useQuery } from 'convex/react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import type { ChangeEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { NavGroup } from '@/lib/convex-server';

type NavLink = { href: string; label: string };

// ─── Reusable link list editor ────────────────────────────────────────────────

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
            placeholder="/path"
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

// ─── Single nav group editor ──────────────────────────────────────────────────

function NavGroupEditor({
  group,
  onChange,
}: {
  group: NavGroup;
  onChange: (g: NavGroup) => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/10">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Trigger label</Label>
          <Input
            value={group.triggerLabel}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...group, triggerLabel: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Overview href</Label>
          <Input
            value={group.overviewHref}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...group, overviewHref: e.target.value })}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Overview title</Label>
          <Input
            value={group.overviewTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...group, overviewTitle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">Overview description</Label>
          <Textarea
            value={group.overviewDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ ...group, overviewDescription: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Sub-links</Label>
        <LinkListEditor
          links={group.links}
          onChange={(links) => onChange({ ...group, links })}
        />
      </div>
    </div>
  );
}

// ─── Standard nav groups tab ──────────────────────────────────────────────────

function StandardGroupsTab({
  groups,
  onChange,
}: {
  groups: NavGroup[];
  onChange: (groups: NavGroup[]) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group, i) => (
        <div key={group.id}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {group.triggerLabel || `Group ${i + 1}`}
          </p>
          <NavGroupEditor
            group={group}
            onChange={(g) => onChange(groups.map((og, idx) => (idx === i ? g : og)))}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Community tab ────────────────────────────────────────────────────────────

const EMPTY_COMMUNITY: NavGroup = {
  id: 'community',
  triggerLabel: 'Community',
  overviewHref: '#',
  overviewTitle: 'Community',
  overviewDescription: 'Connect with our community.',
  links: [],
};

function CommunityTab({
  group,
  onChange,
}: {
  group: NavGroup | null;
  onChange: (g: NavGroup | null) => void;
}) {
  const active = group ?? EMPTY_COMMUNITY;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This dropdown appears in the navbar as a dedicated Community section.
      </p>
      <NavGroupEditor group={active} onChange={onChange} />
      {group && (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onChange(null)}
        >
          <Trash2 className="size-3.5 mr-1.5" />
          Remove Community dropdown
        </Button>
      )}
    </div>
  );
}

// ─── Resource links tab ───────────────────────────────────────────────────────

const EMPTY_RESOURCE: NavGroup = {
  id: 'resources',
  triggerLabel: 'Resources',
  overviewHref: '#',
  overviewTitle: 'Resources',
  overviewDescription: 'Helpful links and resources.',
  links: [],
};

type ShortLink = {
  _id: string;
  code: string;
  destinationUrl: string;
  isActive: boolean;
  metadata?: { title?: string; tags?: string[] };
  clickCount: number;
};

function ResourceTab({
  group,
  onChange,
}: {
  group: NavGroup | null;
  onChange: (g: NavGroup | null) => void;
}) {
  const shortLinks = useQuery(api.linkShortener.listMyLinks, {}) as ShortLink[] | undefined;
  const active = group ?? EMPTY_RESOURCE;

  const addShortLink = (sl: ShortLink) => {
    const href = `/r/${sl.code}`;
    if (active.links.some((l) => l.href === href)) return;
    onChange({
      ...active,
      links: [
        ...active.links,
        { href, label: sl.metadata?.title ?? sl.code },
      ],
    });
  };

  const activeHrefs = new Set(active.links.map((l) => l.href));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Trigger label</Label>
            <Input
              value={active.triggerLabel}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...active, triggerLabel: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Overview href</Label>
            <Input
              value={active.overviewHref}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...active, overviewHref: e.target.value })}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Overview title</Label>
            <Input
              value={active.overviewTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...active, overviewTitle: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs">Overview description</Label>
            <Textarea
              value={active.overviewDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ ...active, overviewDescription: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs">Current resource links</Label>
        <LinkListEditor
          links={active.links}
          onChange={(links) => onChange({ ...active, links })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Add from your short links</Label>
        {shortLinks === undefined ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm p-3 border rounded-lg">
            <Loader2 className="size-4 animate-spin" />
            Loading short links…
          </div>
        ) : shortLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 border rounded-lg">
            No short links found. Create some at <span className="font-mono">/admin/links</span>.
          </p>
        ) : (
          <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
            {shortLinks
              .filter((sl) => sl.isActive)
              .map((sl) => {
                const href = `/r/${sl.code}`;
                const added = activeHrefs.has(href);
                return (
                  <div key={sl._id} className="flex items-center gap-3 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate">/r/{sl.code}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {sl.metadata?.title ?? sl.destinationUrl}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {sl.clickCount} clicks
                    </Badge>
                    <Button
                      size="sm"
                      variant={added ? 'secondary' : 'outline'}
                      disabled={added}
                      onClick={() => addShortLink(sl)}
                    >
                      {added ? 'Added' : 'Add'}
                    </Button>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {group && (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onChange(null)}
        >
          <Trash2 className="size-3.5 mr-1.5" />
          Remove Resources dropdown
        </Button>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function NavigationAdminClient() {
  const chrome = useQuery(api.siteChrome.getSiteChrome);
  const updateNavigation = useMutation(api.siteChrome.updateNavigation);

  const [navGroups, setNavGroups] = React.useState<NavGroup[] | null>(null);
  const [communityNavGroup, setCommunityNavGroup] = React.useState<NavGroup | null | undefined>(
    undefined,
  );
  const [resourceNavGroup, setResourceNavGroup] = React.useState<NavGroup | null | undefined>(
    undefined,
  );
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Seed from loaded data
  React.useEffect(() => {
    if (!chrome) return;
    setNavGroups(chrome.navGroups as NavGroup[]);
    setCommunityNavGroup(chrome.communityNavGroup ?? null);
    setResourceNavGroup(chrome.resourceNavGroup ?? null);
  }, [chrome]);

  const handleSave = async () => {
    if (!navGroups) return;
    setSaving(true);
    try {
      await updateNavigation({
        navGroups,
        communityNavGroup: communityNavGroup ?? undefined,
        resourceNavGroup: resourceNavGroup ?? undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!chrome || navGroups === null || communityNavGroup === undefined) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-4">
        <Loader2 className="size-4 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard">
        <TabsList>
          <TabsTrigger value="standard">Standard Groups</TabsTrigger>
          <TabsTrigger value="community">Community Links</TabsTrigger>
          <TabsTrigger value="resources">Resource Links</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="mt-4">
          <StandardGroupsTab groups={navGroups} onChange={setNavGroups} />
        </TabsContent>

        <TabsContent value="community" className="mt-4">
          <CommunityTab group={communityNavGroup} onChange={setCommunityNavGroup} />
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <ResourceTab group={resourceNavGroup ?? null} onChange={setResourceNavGroup} />
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          {saved ? 'Saved!' : 'Save navigation'}
        </Button>
        <p className="text-xs text-muted-foreground">Changes apply to all visitors immediately.</p>
      </div>
    </div>
  );
}
