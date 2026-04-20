'use client';

import { useMutation, useQuery } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { convexShortLinkBaseUrl, shortLinkPublicUrl } from '@/lib/convex-short-link-base';

export function LinksAdminClient() {
  const baseUrl = useMemo(() => convexShortLinkBaseUrl(), []);
  const links = useQuery(api.linkShortener.listMyLinks, { limit: 200 });
  const initConfig = useMutation(api.linkShortener.initConfig);
  const createLink = useMutation(api.linkShortener.createLink);
  const revokeLink = useMutation(api.linkShortener.revokeLink);
  const deleteLink = useMutation(api.linkShortener.deleteLink);

  const [destinationUrl, setDestinationUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [redirectType, setRedirectType] = useState<301 | 302>(302);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await initConfig({});
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to initialize link shortener');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initConfig]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const dest = destinationUrl.trim();
    if (!dest) {
      setError('Enter a destination URL.');
      return;
    }
    setBusy(true);
    try {
      await createLink({
        destinationUrl: dest,
        code: customCode.trim() || undefined,
        redirectType,
        metadata: title.trim() ? { title: title.trim() } : undefined,
      });
      setDestinationUrl('');
      setCustomCode('');
      setTitle('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create link');
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(code: string) {
    setError(null);
    try {
      await revokeLink({ code });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not revoke link');
    }
  }

  async function onDelete(code: string) {
    if (
      !window.confirm(`Permanently delete “${code}” and its click history? This cannot be undone.`)
    ) {
      return;
    }
    setError(null);
    try {
      await deleteLink({ code });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete link');
    }
  }

  async function copyShortUrl(code: string) {
    const url = shortLinkPublicUrl(code);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setError('Clipboard not available; copy the URL manually.');
    }
  }

  if (links === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!baseUrl ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          Set{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_CONVEX_SITE_URL</code>{' '}
          (or a full Convex cloud URL in{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_CONVEX_URL</code>) so
          admins can copy the correct public short links.
        </p>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={onCreate} className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-medium">New short link</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="shortlink-dest" className="text-xs font-medium text-muted-foreground">
              Destination URL
            </label>
            <input
              id="shortlink-dest"
              type="url"
              required
              placeholder="https://example.com/long/path"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="shortlink-code" className="text-xs font-medium text-muted-foreground">
              Custom code (optional)
            </label>
            <input
              id="shortlink-code"
              type="text"
              placeholder="Auto-generated if empty"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="shortlink-title" className="text-xs font-medium text-muted-foreground">
              Label (optional)
            </label>
            <input
              id="shortlink-title"
              type="text"
              placeholder="Campaign name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="shortlink-redirect"
              className="text-xs font-medium text-muted-foreground"
            >
              Redirect
            </label>
            <select
              id="shortlink-redirect"
              value={redirectType}
              onChange={(e) => setRedirectType(Number(e.target.value) as 301 | 302)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={302}>302 — Temporary</option>
              <option value={301}>301 — Permanent</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create short link'}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Your links</h2>
        {links.length === 0 ? (
          <p className="text-muted-foreground text-sm">No short links yet.</p>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {links.map((row) => {
              const publicUrl = shortLinkPublicUrl(row.code);
              return (
                <li
                  key={row._id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.code}</code>
                      {!row.isActive ? (
                        <span className="text-muted-foreground text-xs">Revoked</span>
                      ) : null}
                      {row.hasPassword ? (
                        <span className="text-muted-foreground text-xs">Password</span>
                      ) : null}
                      <span className="text-muted-foreground text-xs">
                        {row.clickCount} clicks · HTTP {row.redirectType}
                      </span>
                    </div>
                    {row.metadata?.title ? (
                      <p className="text-muted-foreground text-xs">{row.metadata.title}</p>
                    ) : null}
                    <p className="truncate text-sm">{row.destinationUrl}</p>
                    <p className="truncate text-xs text-muted-foreground">{publicUrl}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void copyShortUrl(row.code)}
                    >
                      Copy
                    </Button>
                    {row.isActive ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void onRevoke(row.code)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => void onDelete(row.code)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
