import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { requireAdminOrg } from './lib/adminAuth';
import { extractTocFromTiptapJson } from './lib/tiptapToc';

const tocItem = v.object({
  id: v.string(),
  title: v.string(),
  level: v.number(),
});

function normalizePath(path: string): string {
  const t = path.trim();
  if (!t.startsWith('/')) {
    return `/${t}`;
  }
  return t.replace(/\/+$/, '') || '/';
}

/**
 * Public: TOC for a route.
 * 1) Published `sitePages`: manual `tocItems`, else headings in TipTap `bodyJson`.
 * 2) Else `tocEntries` (static routes, or fallback when CMS body has no headings yet).
 */
export const getTocForPath = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const path = normalizePath(args.path);

    const sitePage = await ctx.db
      .query('sitePages')
      .withIndex('by_path', (q) => q.eq('path', path))
      .unique();

    if (sitePage && sitePage.status === 'published') {
      if (sitePage.tocItems && sitePage.tocItems.length > 0) {
        return sitePage.tocItems;
      }
      if (sitePage.bodyJson?.trim()) {
        const fromDoc = extractTocFromTiptapJson(sitePage.bodyJson);
        if (fromDoc.length > 0) {
          return fromDoc;
        }
      }
    }

    const entry = await ctx.db
      .query('tocEntries')
      .withIndex('by_path', (q) => q.eq('path', path))
      .unique();

    return entry?.items ?? [];
  },
});

/** Admin: replace TOC for a path (used when the page is still static JSX or as fallback). */
export const upsertTocEntry = mutation({
  args: {
    path: v.string(),
    items: v.array(tocItem),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const path = normalizePath(args.path);
    const now = Date.now();
    const existing = await ctx.db
      .query('tocEntries')
      .withIndex('by_path', (q) => q.eq('path', path))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        items: args.items,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert('tocEntries', {
      path,
      items: args.items,
      updatedAt: now,
    });
  },
});
