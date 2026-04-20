import { v } from 'convex/values';

import { internalMutation, query } from './_generated/server';
import { requireAdminOrg } from './lib/adminAuth';

export const record = internalMutation({
  args: {
    type: v.union(v.literal('pageview'), v.literal('event')),
    path: v.string(),
    sessionId: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    ts: v.number(),
    props: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('analyticsEvents', args);
  },
});

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const [todayViews, allViews, todayEvents] = await Promise.all([
      ctx.db
        .query('analyticsEvents')
        .withIndex('by_type_ts', (q) => q.eq('type', 'pageview').gte('ts', todayTs))
        .collect(),
      ctx.db
        .query('analyticsEvents')
        .withIndex('by_type_ts', (q) => q.eq('type', 'pageview').gte('ts', ninetyDaysAgo))
        .take(10000),
      ctx.db
        .query('analyticsEvents')
        .withIndex('by_type_ts', (q) => q.eq('type', 'event').gte('ts', todayTs))
        .collect(),
    ]);

    return {
      pageViewsToday: todayViews.length,
      uniqueSessionsToday: new Set(todayViews.map((e) => e.sessionId)).size,
      totalPageViews: allViews.length,
      eventsToday: todayEvents.length,
    };
  },
});

export const getPageViewsByDay = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_type_ts', (q) => q.eq('type', 'pageview').gte('ts', thirtyDaysAgo))
      .collect();

    const counts = new Map<string, number>();
    for (const e of events) {
      const k = dayKey(e.ts);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }

    const result: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const k = d.toISOString().slice(0, 10);
      result.push({ date: k, count: counts.get(k) ?? 0 });
    }

    return result;
  },
});

export const getTopPages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_type_ts', (q) => q.eq('type', 'pageview').gte('ts', sevenDaysAgo))
      .collect();

    const counts = new Map<string, number>();
    for (const e of events) {
      counts.set(e.path, (counts.get(e.path) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },
});

export const getTopEvents = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_type_ts', (q) => q.eq('type', 'event').gte('ts', sevenDaysAgo))
      .take(1000);

    const counts = new Map<string, number>();
    for (const e of events) {
      if (!e.name) continue;
      counts.set(e.name, (counts.get(e.name) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  },
});

export const getFormFunnel = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const formEvents = [
      'form_start',
      'form_submit_attempt',
      'form_submit_success',
      'form_submit_error',
      'form_abandon',
      'form_validation_error',
    ];

    const results: { name: string; count: number }[] = [];
    for (const name of formEvents) {
      const rows = await ctx.db
        .query('analyticsEvents')
        .withIndex('by_name_ts', (q) => q.eq('name', name).gte('ts', thirtyDaysAgo))
        .take(500);
      results.push({ name, count: rows.length });
    }

    return results;
  },
});

const NEWSLETTER_EVENT_NAMES = ['newsletter_section_view', 'newsletter_subscribe_click'] as const;

export const getNewsletterMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const results: { name: string; count: number }[] = [];
    for (const name of NEWSLETTER_EVENT_NAMES) {
      const rows = await ctx.db
        .query('analyticsEvents')
        .withIndex('by_name_ts', (q) => q.eq('name', name).gte('ts', thirtyDaysAgo))
        .take(500);
      results.push({ name, count: rows.length });
    }
    return results;
  },
});

export const getRecentEvents = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);

    return ctx.db.query('analyticsEvents').withIndex('by_ts').order('desc').take(25);
  },
});
