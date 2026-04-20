import { v } from 'convex/values';
import { ConvexError } from 'convex/values';

import { mutation, query } from './_generated/server';
import { DEFAULT_NEWSLETTER } from './defaults';
import { requireAdminOrg } from './lib/adminAuth';

const ALLOWED_EMBED_ORIGINS = ['substack.com', 'substackcdn.com'];

function sanitizeEmbedHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return '';
  // Allow only iframe tags from trusted origins; reject everything else
  const iframeOnly = /^<iframe(\s[^>]*)?>(\s*<\/iframe>)?$/i.test(trimmed.replace(/\n/g, ' '));
  if (!iframeOnly) {
    throw new ConvexError(
      'Embed HTML must contain only a single <iframe> element. Paste the exact embed code from your newsletter provider.',
    );
  }
  const srcMatch = /\bsrc=["']([^"']+)["']/i.exec(trimmed);
  if (srcMatch) {
    try {
      const url = new URL(srcMatch[1]);
      const trusted = ALLOWED_EMBED_ORIGINS.some(
        (origin) => url.hostname === origin || url.hostname.endsWith('.' + origin),
      );
      if (!trusted) {
        throw new ConvexError(
          `Embed src domain "${url.hostname}" is not in the trusted list. Only Substack embeds are supported.`,
        );
      }
    } catch (e) {
      if (e instanceof ConvexError) throw e;
      throw new ConvexError('Invalid embed src URL.');
    }
  }
  // Strip any on* event handlers and javascript: from the iframe attributes
  return trimmed.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '').replace(/javascript:/gi, '');
}

export const getNewsletterSettings = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query('newsletterSettings')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .unique();
    if (row) {
      return {
        enabled: row.enabled,
        provider: row.provider,
        embedHtml: row.embedHtml,
        subscribeUrl: row.subscribeUrl,
        heading: row.heading,
        subheading: row.subheading,
      };
    }
    return {
      enabled: DEFAULT_NEWSLETTER.enabled,
      provider: DEFAULT_NEWSLETTER.provider,
      embedHtml: DEFAULT_NEWSLETTER.embedHtml,
      subscribeUrl: DEFAULT_NEWSLETTER.subscribeUrl,
      heading: DEFAULT_NEWSLETTER.heading,
      subheading: DEFAULT_NEWSLETTER.subheading,
    };
  },
});

export const updateNewsletterSettings = mutation({
  args: {
    enabled: v.boolean(),
    provider: v.union(v.literal('none'), v.literal('substack_embed')),
    embedHtml: v.optional(v.string()),
    subscribeUrl: v.optional(v.string()),
    heading: v.optional(v.string()),
    subheading: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query('newsletterSettings')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .unique();
    const embedHtml = args.embedHtml ? sanitizeEmbedHtml(args.embedHtml) : undefined;

    const payload = {
      enabled: args.enabled,
      provider: args.provider,
      embedHtml,
      subscribeUrl: args.subscribeUrl,
      heading: args.heading,
      subheading: args.subheading,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('newsletterSettings', {
      key: 'default',
      ...payload,
    });
  },
});
