import { ConvexHttpClient } from 'convex/browser';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { api } from '@/convex/_generated/api';
import { fetchBackboardJson, getBackboardApiBase } from '@/lib/backboard-server';
import {
  DEFAULT_HELP_OUT_ROLES,
  DEFAULT_REGIONS,
  DEFAULT_SITE_CHROME,
  DEFAULT_STATES,
  DEFAULT_TOC_ENTRIES,
} from '@/convex/defaults';
import type { TOCItem } from '@/lib/toc';

export type NavGroup = {
  id: string;
  triggerLabel: string;
  overviewHref: string;
  overviewTitle: string;
  overviewDescription: string;
  links: { href: string; label: string }[];
};

export type SiteChromePayload = {
  brandLabel: string;
  navGroups: NavGroup[];
  communityNavGroup?: NavGroup | null;
  resourceNavGroup?: NavGroup | null;
  footerBrandName: string;
  footerTagline: string;
  footerColumns: (typeof DEFAULT_SITE_CHROME.footerColumns)[number][];
  copyrightText: string;
};

export type SitePagePayload = {
  path: string;
  sectionKey: string;
  parentPath?: string;
  title: string;
  description?: string;
  bodyJson?: string;
  tocItems?: TOCItem[];
  lastUpdatedLabel?: string;
  updatedAt: number;
};

/** Cache tags for `revalidateTag` (e.g. from a Convex webhook after admin publishes). */
export const CONVEX_SERVER_CACHE_TAGS = {
  siteChrome: 'convex-public-site-chrome',
  newsletter: 'convex-public-newsletter',
} as const;

export type HelpOutFormByRolePayload = {
  roleSlug: string;
  title: string;
  description: string;
  requirements: string[];
  fieldConfig?: Array<{
    fieldKey: string;
    label: string;
    placeholder?: string;
    visible: boolean;
    required: boolean;
    order: number;
  }>;
};

export type HelpOutFormPicklistsPayload = {
  regions: string[];
  states: string[];
};

export type NewsletterPayload = {
  enabled: boolean;
  provider: 'none' | 'substack_embed';
  embedHtml?: string;
  subscribeUrl?: string;
  heading?: string;
  subheading?: string;
};

export type RoleFormCard = {
  roleSlug: string;
  title: string;
  description: string;
};

function normalizePathLocal(path: string): string {
  const t = path.trim();
  if (!t.startsWith('/')) {
    return `/${t}`;
  }
  return t.replace(/\/+$/, '') || '/';
}

export function getConvexDeploymentUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

function defaultSiteChrome(): SiteChromePayload {
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
}

function defaultNewsletter(): NewsletterPayload {
  return {
    enabled: true,
    provider: 'substack_embed',
    heading: 'Newsletter',
    subheading: 'Subscribe for updates. Substack embed can be added from the admin when ready.',
  };
}

async function querySiteChromeFromSource(): Promise<SiteChromePayload> {
  if (getBackboardApiBase()) {
    return await fetchBackboardJson<SiteChromePayload>('/api/v1/site-chrome');
  }
  const url = getConvexDeploymentUrl();
  if (!url) throw new Error('missing NEXT_PUBLIC_CONVEX_URL');
  const client = new ConvexHttpClient(url);
  return await client.query(api.siteChrome.getSiteChrome, {});
}

const getSiteChromeDataCached = unstable_cache(
  querySiteChromeFromSource,
  ['convex-query-site-chrome-v2-bff'],
  {
    revalidate: 120,
    tags: [CONVEX_SERVER_CACHE_TAGS.siteChrome],
  },
);

export async function getSiteChromeServer(): Promise<SiteChromePayload> {
  if (!getConvexDeploymentUrl() && !getBackboardApiBase()) {
    return defaultSiteChrome();
  }
  try {
    return await getSiteChromeDataCached();
  } catch {
    return defaultSiteChrome();
  }
}

async function queryNewsletterFromSource(): Promise<NewsletterPayload> {
  if (getBackboardApiBase()) {
    return await fetchBackboardJson<NewsletterPayload>('/api/v1/newsletter');
  }
  const url = getConvexDeploymentUrl();
  if (!url) throw new Error('missing NEXT_PUBLIC_CONVEX_URL');
  const client = new ConvexHttpClient(url);
  return await client.query(api.newsletter.getNewsletterSettings, {});
}

const getNewsletterDataCached = unstable_cache(
  queryNewsletterFromSource,
  ['convex-query-newsletter-v2-bff'],
  {
    revalidate: 120,
    tags: [CONVEX_SERVER_CACHE_TAGS.newsletter],
  },
);

export async function getNewsletterServer(): Promise<NewsletterPayload> {
  if (!getConvexDeploymentUrl() && !getBackboardApiBase()) {
    return defaultNewsletter();
  }
  try {
    return await getNewsletterDataCached();
  } catch {
    return defaultNewsletter();
  }
}

async function loadTocForPath(path: string): Promise<TOCItem[]> {
  const normalized = normalizePathLocal(path);
  const localFallback = DEFAULT_TOC_ENTRIES.find((e) => e.path === normalized)?.items ?? [];
  const url = getConvexDeploymentUrl();
  if (!url && !getBackboardApiBase()) {
    return localFallback;
  }
  try {
    if (getBackboardApiBase()) {
      const data = await fetchBackboardJson<{ items: TOCItem[] }>(
        `/api/v1/toc?path=${encodeURIComponent(normalized)}`,
      );
      return data.items;
    }
    const client = new ConvexHttpClient(url!);
    const items = await client.query(api.toc.getTocForPath, { path: normalized });
    return items;
  } catch {
    return localFallback;
  }
}

/** Table of contents for a pathname — Convex query, or static fallback from `DEFAULT_TOC_ENTRIES`. */
export const getTocForPathServer = cache(loadTocForPath);

async function loadPageByPath(path: string): Promise<SitePagePayload | null> {
  const url = getConvexDeploymentUrl();
  if (!url && !getBackboardApiBase()) return null;
  try {
    const normalized = path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`;
    const pathArg = normalized.replace(/\/+$/, '') || '/';
    if (getBackboardApiBase()) {
      return await fetchBackboardJson<SitePagePayload | null>(
        `/api/v1/pages/by-path?path=${encodeURIComponent(pathArg)}`,
      );
    }
    const client = new ConvexHttpClient(url!);
    const data = await client.query(api.sitePages.getPageByPath, {
      path: pathArg,
    });
    return data;
  } catch {
    return null;
  }
}

export const getPageByPathServer = cache(loadPageByPath);

async function loadPublishedLegalSlugs(): Promise<string[]> {
  const url = getConvexDeploymentUrl();
  if (!url && !getBackboardApiBase()) return [];
  try {
    if (getBackboardApiBase()) {
      const data = await fetchBackboardJson<{ slugs: string[] }>('/api/v1/legal-slugs');
      return data.slugs;
    }
    const client = new ConvexHttpClient(url!);
    return await client.query(api.sitePages.listPublishedLegalSlugs, {});
  } catch {
    return [];
  }
}

export const listPublishedLegalSlugsCached = cache(loadPublishedLegalSlugs);

async function loadHelpOutFormByRole(roleSlug: string): Promise<HelpOutFormByRolePayload | null> {
  const url = getConvexDeploymentUrl();
  if (!url && !getBackboardApiBase()) return null;
  try {
    if (getBackboardApiBase()) {
      return await fetchBackboardJson<HelpOutFormByRolePayload | null>(
        `/api/v1/help-out/form?roleSlug=${encodeURIComponent(roleSlug)}`,
      );
    }
    const client = new ConvexHttpClient(url!);
    return await client.query(api.helpOut.getFormByRole, { roleSlug });
  } catch {
    return null;
  }
}

export const getHelpOutFormByRoleCached = cache(loadHelpOutFormByRole);

async function loadFormPicklists(): Promise<HelpOutFormPicklistsPayload> {
  const url = getConvexDeploymentUrl();
  if (!url && !getBackboardApiBase()) {
    return { regions: [...DEFAULT_REGIONS], states: [...DEFAULT_STATES] };
  }
  try {
    if (getBackboardApiBase()) {
      return await fetchBackboardJson<HelpOutFormPicklistsPayload>('/api/v1/help-out/picklists');
    }
    const client = new ConvexHttpClient(url!);
    return await client.query(api.helpOut.getFormPicklists, {});
  } catch {
    return { regions: [...DEFAULT_REGIONS], states: [...DEFAULT_STATES] };
  }
}

export const getFormPicklistsServer = cache(loadFormPicklists);

export async function getRoleFormsForMarketing(): Promise<RoleFormCard[]> {
  const url = getConvexDeploymentUrl();
  const fallback: RoleFormCard[] = DEFAULT_HELP_OUT_ROLES.map((r) => ({
    roleSlug: r.roleSlug,
    title: r.title,
    description: r.description,
  }));
  if (!url && !getBackboardApiBase()) return fallback;
  try {
    if (getBackboardApiBase()) {
      const rows = await fetchBackboardJson<RoleFormCard[]>('/api/v1/help-out/role-forms');
      if (!rows.length) return fallback;
      return rows;
    }
    const client = new ConvexHttpClient(url!);
    const rows = await client.query(api.helpOut.getRoleForms, {});
    if (!rows.length) return fallback;
    return rows;
  } catch {
    return fallback;
  }
}
