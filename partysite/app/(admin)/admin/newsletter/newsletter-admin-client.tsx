'use client';

import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';

export function NewsletterAdminClient() {
  const settings = useQuery(api.newsletter.getNewsletterSettings);
  const update = useMutation(api.newsletter.updateNewsletterSettings);

  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<'none' | 'substack_embed'>('none');
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [embedHtml, setEmbedHtml] = useState('');
  const [subscribeUrl, setSubscribeUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setProvider(settings.provider);
    setHeading(settings.heading ?? '');
    setSubheading(settings.subheading ?? '');
    setEmbedHtml(settings.embedHtml ?? '');
    setSubscribeUrl(settings.subscribeUrl ?? '');
  }, [settings]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await update({
        enabled,
        provider,
        heading: heading.trim() || undefined,
        subheading: subheading.trim() || undefined,
        embedHtml: embedHtml.trim() || undefined,
        subscribeUrl: subscribeUrl.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  if (settings === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          id="newsletter-enabled"
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="size-4 rounded border-input"
        />
        <label htmlFor="newsletter-enabled" className="text-sm font-medium">
          Show newsletter block in site footer
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor="newsletter-provider" className="text-sm font-medium">
          Provider
        </label>
        <select
          id="newsletter-provider"
          className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={provider}
          onChange={(e) => setProvider(e.target.value as 'none' | 'substack_embed')}
        >
          <option value="none">None</option>
          <option value="substack_embed">Substack embed</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="newsletter-heading" className="text-sm font-medium">
          Heading
        </label>
        <input
          id="newsletter-heading"
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder='e.g. "Newsletter"'
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="newsletter-subheading" className="text-sm font-medium">
          Subheading
        </label>
        <input
          id="newsletter-subheading"
          type="text"
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="newsletter-embed" className="text-sm font-medium">
          Embed HTML
        </label>
        <textarea
          id="newsletter-embed"
          value={embedHtml}
          onChange={(e) => setEmbedHtml(e.target.value)}
          rows={8}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          placeholder="Paste Substack embed snippet"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="newsletter-subscribe" className="text-sm font-medium">
          Subscribe URL (optional)
        </label>
        <input
          id="newsletter-subscribe"
          type="url"
          value={subscribeUrl}
          onChange={(e) => setSubscribeUrl(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="https://…"
        />
        <p className="text-xs text-muted-foreground">
          Shown when no embed is set, or as a fallback link below the embed.
        </p>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
