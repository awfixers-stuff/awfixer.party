import { v } from 'convex/values';
import { ConvexError } from 'convex/values';

import { mutation, query } from './_generated/server';
import { requireAdminOrg } from './lib/adminAuth';

const tocItem = v.object({
  id: v.string(),
  title: v.string(),
  level: v.number(),
});

export const getPageByPath = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizePath(args.path);
    const row = await ctx.db
      .query('sitePages')
      .withIndex('by_path', (q) => q.eq('path', normalized))
      .unique();
    if (!row || row.status !== 'published') {
      return null;
    }
    return {
      path: row.path,
      sectionKey: row.sectionKey,
      parentPath: row.parentPath,
      title: row.title,
      description: row.description,
      bodyJson: row.bodyJson,
      tocItems: row.tocItems ?? undefined,
      lastUpdatedLabel: row.lastUpdatedLabel,
      updatedAt: row.updatedAt,
    };
  },
});

export const getPageByPathAdmin = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const normalized = normalizePath(args.path);
    const row = await ctx.db
      .query('sitePages')
      .withIndex('by_path', (q) => q.eq('path', normalized))
      .unique();
    if (!row) return null;
    return {
      path: row.path,
      sectionKey: row.sectionKey,
      parentPath: row.parentPath,
      title: row.title,
      description: row.description,
      bodyJson: row.bodyJson,
      tocItems: row.tocItems,
      status: row.status,
      lastUpdatedLabel: row.lastUpdatedLabel,
      updatedAt: row.updatedAt,
    };
  },
});

export const listPagesBySection = query({
  args: { sectionKey: v.string() },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    return await ctx.db
      .query('sitePages')
      .withIndex('by_section', (q) => q.eq('sectionKey', args.sectionKey))
      .collect();
  },
});

export const listAllPaths = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);
    const pages = await ctx.db.query('sitePages').collect();
    return pages.map((p) => ({
      path: p.path,
      title: p.title,
      status: p.status,
      sectionKey: p.sectionKey,
    }));
  },
});

export const upsertPage = mutation({
  args: {
    path: v.string(),
    sectionKey: v.string(),
    parentPath: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    bodyJson: v.optional(v.string()),
    tocItems: v.optional(v.array(tocItem)),
    status: v.union(v.literal('draft'), v.literal('published')),
    lastUpdatedLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const path = normalizePath(args.path);
    const now = Date.now();
    const existing = await ctx.db
      .query('sitePages')
      .withIndex('by_path', (q) => q.eq('path', path))
      .unique();
    const payload = {
      path,
      sectionKey: args.sectionKey,
      parentPath: args.parentPath,
      title: args.title,
      description: args.description,
      bodyJson: args.bodyJson,
      tocItems: args.tocItems,
      status: args.status,
      lastUpdatedLabel: args.lastUpdatedLabel,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('sitePages', payload);
  },
});

export const listPublishedLegalSlugs = query({
  args: {},
  handler: async (ctx) => {
    const published = await ctx.db
      .query('sitePages')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .take(100);
    return published
      .filter((p) => p.path.startsWith('/legal/'))
      .map((p) => p.path.slice('/legal/'.length))
      .filter((s) => s.length > 0);
  },
});

export const deletePage = mutation({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const path = normalizePath(args.path);
    const existing = await ctx.db
      .query('sitePages')
      .withIndex('by_path', (q) => q.eq('path', path))
      .unique();
    if (!existing) {
      throw new ConvexError('Page not found');
    }
    await ctx.db.delete(existing._id);
  },
});

function normalizePath(path: string): string {
  const t = path.trim();
  if (!t.startsWith('/')) {
    return `/${t}`;
  }
  return t.replace(/\/+$/, '') || '/';
}
