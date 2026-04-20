import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { DEFAULT_SITE_CHROME } from './defaults';
import { requireAdminOrg } from './lib/adminAuth';

const navLink = v.object({
  href: v.string(),
  label: v.string(),
});

const navGroup = v.object({
  id: v.string(),
  triggerLabel: v.string(),
  overviewHref: v.string(),
  overviewTitle: v.string(),
  overviewDescription: v.string(),
  links: v.array(navLink),
});

const footerColumn = v.object({
  id: v.string(),
  heading: v.string(),
  links: v.array(navLink),
});

export const getSiteChrome = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query('siteChrome')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique();
    if (row) {
      return {
        brandLabel: row.brandLabel,
        navGroups: row.navGroups,
        communityNavGroup: row.communityNavGroup ?? null,
        resourceNavGroup: row.resourceNavGroup ?? null,
        footerBrandName: row.footerBrandName,
        footerTagline: row.footerTagline,
        footerColumns: row.footerColumns,
        copyrightText: row.copyrightText,
      };
    }
    return {
      brandLabel: DEFAULT_SITE_CHROME.brandLabel,
      navGroups: DEFAULT_SITE_CHROME.navGroups,
      communityNavGroup: null,
      resourceNavGroup: null,
      footerBrandName: DEFAULT_SITE_CHROME.footerBrandName,
      footerTagline: DEFAULT_SITE_CHROME.footerTagline,
      footerColumns: DEFAULT_SITE_CHROME.footerColumns,
      copyrightText: DEFAULT_SITE_CHROME.copyrightText,
    };
  },
});

export const updateSiteChrome = mutation({
  args: {
    brandLabel: v.string(),
    navGroups: v.array(navGroup),
    footerBrandName: v.string(),
    footerTagline: v.string(),
    footerColumns: v.array(footerColumn),
    copyrightText: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query('siteChrome')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        brandLabel: args.brandLabel,
        navGroups: args.navGroups,
        footerBrandName: args.footerBrandName,
        footerTagline: args.footerTagline,
        footerColumns: args.footerColumns,
        copyrightText: args.copyrightText,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert('siteChrome', {
      key: 'main',
      brandLabel: args.brandLabel,
      navGroups: args.navGroups,
      footerBrandName: args.footerBrandName,
      footerTagline: args.footerTagline,
      footerColumns: args.footerColumns,
      copyrightText: args.copyrightText,
      updatedAt: now,
    });
  },
});

export const updateNavigation = mutation({
  args: {
    navGroups: v.array(navGroup),
    communityNavGroup: v.optional(navGroup),
    resourceNavGroup: v.optional(navGroup),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query('siteChrome')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        navGroups: args.navGroups,
        communityNavGroup: args.communityNavGroup,
        resourceNavGroup: args.resourceNavGroup,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert('siteChrome', {
      key: 'main',
      brandLabel: DEFAULT_SITE_CHROME.brandLabel,
      navGroups: args.navGroups,
      communityNavGroup: args.communityNavGroup,
      resourceNavGroup: args.resourceNavGroup,
      footerBrandName: DEFAULT_SITE_CHROME.footerBrandName,
      footerTagline: DEFAULT_SITE_CHROME.footerTagline,
      footerColumns: DEFAULT_SITE_CHROME.footerColumns,
      copyrightText: DEFAULT_SITE_CHROME.copyrightText,
      updatedAt: now,
    });
  },
});

export const updateFooter = mutation({
  args: {
    footerBrandName: v.string(),
    footerTagline: v.string(),
    footerColumns: v.array(footerColumn),
    copyrightText: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query('siteChrome')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        footerBrandName: args.footerBrandName,
        footerTagline: args.footerTagline,
        footerColumns: args.footerColumns,
        copyrightText: args.copyrightText,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert('siteChrome', {
      key: 'main',
      brandLabel: DEFAULT_SITE_CHROME.brandLabel,
      navGroups: DEFAULT_SITE_CHROME.navGroups,
      footerBrandName: args.footerBrandName,
      footerTagline: args.footerTagline,
      footerColumns: args.footerColumns,
      copyrightText: args.copyrightText,
      updatedAt: now,
    });
  },
});
