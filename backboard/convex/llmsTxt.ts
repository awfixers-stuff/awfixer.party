import { query } from './_generated/server';
import { DEFAULT_SITE_CHROME } from './defaults';

function normalizePath(path: string): string {
  const t = path.trim();
  if (!t.startsWith('/')) {
    return `/${t}`;
  }
  return t.replace(/\/+$/, '') || '/';
}

/**
 * Live data for llms.txt: nav from site chrome + published CMS pages not already linked in nav.
 */
export const getLlmsTxtPayload = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query('siteChrome')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique();

    const navGroups = row?.navGroups ?? DEFAULT_SITE_CHROME.navGroups;

    const navHrefs = new Set<string>();
    for (const g of navGroups) {
      navHrefs.add(normalizePath(g.overviewHref));
      for (const l of g.links) {
        navHrefs.add(normalizePath(l.href));
      }
    }

    const pages = await ctx.db.query('sitePages').collect();
    const cmsPages = pages
      .filter((p) => p.status === 'published')
      .filter((p) => !navHrefs.has(normalizePath(p.path)))
      .map((p) => ({ path: p.path, title: p.title }));

    return {
      navGroups,
      cmsPages,
    };
  },
});
