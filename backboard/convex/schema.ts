import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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

const fieldUiConfig = v.object({
  fieldKey: v.string(),
  label: v.string(),
  placeholder: v.optional(v.string()),
  visible: v.boolean(),
  required: v.boolean(),
  order: v.number(),
});

const tocItem = v.object({
  id: v.string(),
  title: v.string(),
  level: v.number(),
});

export default defineSchema({
  /** Singleton row `key === "main"` — nav + footer copy/structure. */
  siteChrome: defineTable({
    key: v.string(),
    brandLabel: v.string(),
    navGroups: v.array(navGroup),
    communityNavGroup: v.optional(navGroup),
    resourceNavGroup: v.optional(navGroup),
    footerBrandName: v.string(),
    footerTagline: v.string(),
    footerColumns: v.array(footerColumn),
    copyrightText: v.string(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  /** Singleton `key === "default"` — picklists for help-out forms. */
  formPicklists: defineTable({
    key: v.string(),
    regions: v.array(v.string()),
    states: v.array(v.string()),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  /** Help Out role application copy + form UI; one row per roleSlug. */
  helpOutForms: defineTable({
    roleSlug: v.string(),
    title: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    fieldConfig: v.optional(v.array(fieldUiConfig)),
    published: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_roleSlug', ['roleSlug']),

  helpOutSubmissions: defineTable({
    userId: v.string(),
    roleSlug: v.string(),
    twitterHandle: v.optional(v.string()),
    discordUsername: v.optional(v.string()),
    discordUserId: v.optional(v.string()),
    hasPoliticalExperience: v.boolean(),
    region: v.optional(v.string()),
    state: v.optional(v.string()),
    county: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    name: v.string(),
    nickname: v.optional(v.string()),
    helpWith: v.string(),
    submittedAt: v.number(),
    reviewed: v.boolean(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
  })
    .index('by_roleSlug', ['roleSlug'])
    .index('by_userId', ['userId'])
    .index('by_reviewed', ['reviewed']),

  /** CMS pages (TipTap JSON). Unique `path` (e.g. `/legal/privacy`). */
  sitePages: defineTable({
    path: v.string(),
    sectionKey: v.string(),
    parentPath: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    /** JSON.stringify(Tiptap JSON) */
    bodyJson: v.optional(v.string()),
    /** Optional manual TOC; otherwise derived from `bodyJson` headings. */
    tocItems: v.optional(v.array(tocItem)),
    status: v.union(v.literal('draft'), v.literal('published')),
    lastUpdatedLabel: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_path', ['path'])
    .index('by_section', ['sectionKey'])
    .index('by_status', ['status']),

  /** TOC for routes not (yet) backed by `sitePages`, or as fallback. */
  tocEntries: defineTable({
    path: v.string(),
    items: v.array(tocItem),
    updatedAt: v.number(),
  }).index('by_path', ['path']),

  /** Raw analytics event log — pageviews and custom events. */
  analyticsEvents: defineTable({
    type: v.union(v.literal('pageview'), v.literal('event')),
    path: v.string(),
    sessionId: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    ts: v.number(),
    props: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
  })
    .index('by_ts', ['ts'])
    .index('by_type_ts', ['type', 'ts'])
    .index('by_name_ts', ['name', 'ts']),

  /** Singleton `key === "default"` — Substack embed added later. */
  newsletterSettings: defineTable({
    key: v.string(),
    enabled: v.boolean(),
    provider: v.union(v.literal('none'), v.literal('substack_embed')),
    /** Sanitized embed HTML when admin pastes Substack snippet. */
    embedHtml: v.optional(v.string()),
    /** Optional public profile URL for “Subscribe on Substack” link. */
    subscribeUrl: v.optional(v.string()),
    heading: v.optional(v.string()),
    subheading: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_key', ['key']),
});
