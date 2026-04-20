import { v } from 'convex/values';
import { ConvexError } from 'convex/values';

import { internalMutation, mutation, query } from './_generated/server';
import type { QueryCtx, MutationCtx } from './_generated/server';
import {
  DEFAULT_HELP_OUT_ROLES,
  DEFAULT_REGIONS,
  DEFAULT_STATES,
  DEFAULT_SITE_CHROME,
  DEFAULT_TOC_ENTRIES,
} from './defaults';
import { requireAdminOrg } from './lib/adminAuth';

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 1;

const fieldUiConfig = v.object({
  fieldKey: v.string(),
  label: v.string(),
  placeholder: v.optional(v.string()),
  visible: v.boolean(),
  required: v.boolean(),
  order: v.number(),
});

type Ctx = QueryCtx | MutationCtx;

async function getPicklists(ctx: Ctx) {
  const row = await ctx.db
    .query('formPicklists')
    .withIndex('by_key', (q) => q.eq('key', 'default'))
    .unique();
  return {
    regions: row?.regions?.length ? row.regions : DEFAULT_REGIONS,
    states: row?.states?.length ? row.states : DEFAULT_STATES,
  };
}

function sanitizeInput(str: string): string {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function validateTwitterHandle(handle: string | undefined): string | undefined {
  if (!handle || handle.trim() === '') return undefined;
  const cleaned = sanitizeInput(handle);
  if (!/^@?[\w]{1,15}$/.test(cleaned)) {
    throw new ConvexError('Invalid Twitter handle format');
  }
  return cleaned;
}

function validateDiscordUsername(username: string | undefined): string | undefined {
  if (!username || username.trim() === '') return undefined;
  const cleaned = sanitizeInput(username);
  if (!/^.{2,32}(#\d{4})?$/.test(cleaned)) {
    throw new ConvexError('Invalid Discord username format');
  }
  return cleaned;
}

function validateDiscordUserId(userId: string | undefined): string | undefined {
  if (!userId || userId.trim() === '') return undefined;
  const cleaned = sanitizeInput(userId);
  if (!/^\d{17,19}$/.test(cleaned)) {
    throw new ConvexError('Invalid Discord user ID - must be 17-19 digits');
  }
  return cleaned;
}

function validateZipCode(zip: string): string {
  const cleaned = sanitizeInput(zip);
  if (!/^\d{5}(-\d{4})?$/.test(cleaned)) {
    throw new ConvexError('Invalid ZIP code format');
  }
  return cleaned;
}

function validateEmail(email: string): string {
  const cleaned = sanitizeInput(email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    throw new ConvexError('Invalid email format');
  }
  return cleaned;
}

function validatePhoneNumber(phone: string | undefined): string | undefined {
  if (!phone || phone.trim() === '') return undefined;
  const cleaned = sanitizeInput(phone).replace(/\D/g, '');
  if (!/^1?\d{10}$/.test(cleaned)) {
    throw new ConvexError('Invalid phone number format');
  }
  return cleaned;
}

function validateName(name: string): string {
  const cleaned = sanitizeInput(name);
  if (cleaned.length < 2 || cleaned.length > 100) {
    throw new ConvexError('Name must be between 2 and 100 characters');
  }
  return cleaned;
}

function validateNickname(nickname: string | undefined): string | undefined {
  if (!nickname || nickname.trim() === '') return undefined;
  const cleaned = sanitizeInput(nickname);
  if (cleaned.length > 50) {
    throw new ConvexError('Nickname must be 50 characters or fewer');
  }
  return cleaned;
}

function validateHelpWith(text: string): string {
  const cleaned = sanitizeInput(text);
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) {
    throw new ConvexError('Please provide at least 10 words describing how you want to help');
  }
  if (wordCount > 500) {
    throw new ConvexError('Response must be 500 words or fewer');
  }
  return cleaned;
}

async function validateRegion(ctx: Ctx, region: string | undefined): Promise<string | undefined> {
  if (!region || region.trim() === '') return undefined;
  const { regions } = await getPicklists(ctx);
  const cleaned = sanitizeInput(region);
  if (!regions.includes(cleaned)) {
    throw new ConvexError(`Invalid region. Must be one of: ${regions.join(', ')}`);
  }
  return cleaned;
}

async function validateState(ctx: Ctx, state: string | undefined): Promise<string | undefined> {
  if (!state || state.trim() === '') return undefined;
  const { states } = await getPicklists(ctx);
  const cleaned = sanitizeInput(state);
  if (!states.includes(cleaned)) {
    throw new ConvexError('Invalid US state');
  }
  return cleaned;
}

function validateCounty(county: string | undefined): string | undefined {
  if (!county || county.trim() === '') return undefined;
  const cleaned = sanitizeInput(county);
  if (cleaned.length > 100) {
    throw new ConvexError('County name must be 100 characters or fewer');
  }
  return cleaned;
}

function validateCity(city: string | undefined): string | undefined {
  if (!city || city.trim() === '') return undefined;
  const cleaned = sanitizeInput(city);
  if (cleaned.length > 100) {
    throw new ConvexError('City name must be 100 characters or fewer');
  }
  return cleaned;
}

function normalizeRoleSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/\s+/g, '_');
}

export const getFormPicklists = query({
  args: {},
  handler: async (ctx) => {
    return await getPicklists(ctx);
  },
});

export const getFormByRole = query({
  args: { roleSlug: v.string() },
  handler: async (ctx, args) => {
    const slug = normalizeRoleSlug(args.roleSlug);
    const row = await ctx.db
      .query('helpOutForms')
      .withIndex('by_roleSlug', (q) => q.eq('roleSlug', slug))
      .unique();
    if (!row || !row.published) {
      return null;
    }
    return {
      roleSlug: row.roleSlug,
      title: row.title,
      description: row.description,
      requirements: row.requirements,
      fieldConfig: row.fieldConfig,
    };
  },
});

export const getRoleForms = query({
  args: {},
  handler: async (ctx) => {
    const rows = (await ctx.db.query('helpOutForms').collect()).filter((r) => r.published);
    const sorted = rows.sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.map((row) => ({
      roleSlug: row.roleSlug,
      title: row.title,
      description: row.description,
      requirements: row.requirements,
    }));
  },
});

export const listPublishedRoleSlugs = query({
  args: {},
  handler: async (ctx) => {
    const rows = (await ctx.db.query('helpOutForms').collect()).filter((r) => r.published);
    return rows.sort((a, b) => a.sortOrder - b.sortOrder).map((r) => r.roleSlug);
  },
});

export const listHelpOutFormsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);
    const rows = await ctx.db.query('helpOutForms').collect();
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const upsertHelpOutForm = mutation({
  args: {
    roleSlug: v.string(),
    title: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    fieldConfig: v.optional(v.array(fieldUiConfig)),
    published: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const roleSlug = normalizeRoleSlug(args.roleSlug);
    if (!/^[a-z0-9_]{1,64}$/.test(roleSlug)) {
      throw new ConvexError('roleSlug must be 1–64 chars: lowercase letters, digits, underscores');
    }
    const now = Date.now();
    const existing = await ctx.db
      .query('helpOutForms')
      .withIndex('by_roleSlug', (q) => q.eq('roleSlug', roleSlug))
      .unique();
    const payload = {
      roleSlug,
      title: args.title,
      description: args.description,
      requirements: args.requirements,
      fieldConfig: args.fieldConfig,
      published: args.published,
      sortOrder: args.sortOrder,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('helpOutForms', {
      ...payload,
      createdAt: now,
    });
  },
});

export const updateFormPicklists = mutation({
  args: {
    regions: v.array(v.string()),
    states: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrg(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query('formPicklists')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        regions: args.regions,
        states: args.states,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert('formPicklists', {
      key: 'default',
      regions: args.regions,
      states: args.states,
      updatedAt: now,
    });
  },
});

export const submitHelpOutForm = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('You must be logged in to submit this form');
    }
    const userId = identity.tokenIdentifier;
    const roleSlug = normalizeRoleSlug(args.roleSlug);

    const form = await ctx.db
      .query('helpOutForms')
      .withIndex('by_roleSlug', (q) => q.eq('roleSlug', roleSlug))
      .unique();
    if (!form || !form.published) {
      throw new ConvexError('Invalid or unavailable role');
    }

    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recent = await ctx.db
      .query('helpOutSubmissions')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .take(10);
    const recentForRole = recent.filter(
      (s) => s.submittedAt >= windowStart && s.roleSlug === roleSlug,
    );
    if (recentForRole.length >= RATE_LIMIT_MAX) {
      throw new ConvexError(
        'You have already submitted this form. Please wait 24 hours before submitting again.',
      );
    }

    const validated = {
      userId,
      roleSlug,
      twitterHandle: validateTwitterHandle(args.twitterHandle),
      discordUsername: validateDiscordUsername(args.discordUsername),
      discordUserId: validateDiscordUserId(args.discordUserId),
      hasPoliticalExperience: args.hasPoliticalExperience,
      region: await validateRegion(ctx, args.region),
      state: await validateState(ctx, args.state),
      county: validateCounty(args.county),
      city: validateCity(args.city),
      zipCode: validateZipCode(args.zipCode),
      email: validateEmail(args.email),
      phoneNumber: validatePhoneNumber(args.phoneNumber),
      name: validateName(args.name),
      nickname: validateNickname(args.nickname),
      helpWith: validateHelpWith(args.helpWith),
      submittedAt: Date.now(),
      reviewed: false,
    };

    return await ctx.db.insert('helpOutSubmissions', validated);
  },
});

export const listSubmissions = query({
  args: {
    roleSlug: v.optional(v.string()),
    reviewed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      await requireAdminOrg(ctx);
      let results;
      if (args.roleSlug) {
        const slug = normalizeRoleSlug(args.roleSlug);
        results = await ctx.db
          .query('helpOutSubmissions')
          .withIndex('by_roleSlug', (q) => q.eq('roleSlug', slug))
          .order('desc')
          .take(200);
      } else {
        results = await ctx.db.query('helpOutSubmissions').order('desc').take(200);
      }
      if (args.reviewed !== undefined) {
        return results.filter((s) => s.reviewed === args.reviewed);
      }
      return results;
    } catch (err) {
      if (err instanceof ConvexError) throw err;
      throw new ConvexError(
        `Failed to list submissions: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  },
});

export const getSubmission = query({
  args: { submissionId: v.id('helpOutSubmissions') },
  handler: async (ctx, args) => {
    try {
      await requireAdminOrg(ctx);
      return await ctx.db.get('helpOutSubmissions', args.submissionId);
    } catch (err) {
      if (err instanceof ConvexError) throw err;
      throw new ConvexError(
        `Failed to get submission: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  },
});

export const markReviewed = mutation({
  args: { submissionId: v.id('helpOutSubmissions') },
  handler: async (ctx, args) => {
    try {
      const identity = await requireAdminOrg(ctx);
      const existing = await ctx.db.get('helpOutSubmissions', args.submissionId);
      if (!existing) {
        throw new ConvexError('Submission not found');
      }
      await ctx.db.patch(args.submissionId, {
        reviewed: true,
        reviewedAt: Date.now(),
        reviewedBy: identity.tokenIdentifier,
      });
    } catch (err) {
      if (err instanceof ConvexError) throw err;
      throw new ConvexError(
        `Failed to mark submission as reviewed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  },
});

export const deleteSubmission = mutation({
  args: { submissionId: v.id('helpOutSubmissions') },
  handler: async (ctx, args) => {
    try {
      await requireAdminOrg(ctx);
      const existing = await ctx.db.get('helpOutSubmissions', args.submissionId);
      if (!existing) {
        throw new ConvexError('Submission not found');
      }
      await ctx.db.delete(args.submissionId);
    } catch (err) {
      if (err instanceof ConvexError) throw err;
      throw new ConvexError(
        `Failed to delete submission: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  },
});

function docFromPlainText(text: string): string {
  return JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  });
}

const LEGAL_PAGE_SEED = [
  {
    path: '/legal/privacy',
    title: 'Privacy Policy',
    description: 'Learn about how we collect, use, and protect your data.',
    body: 'We use third-party tracking on this website. For questions about our privacy practices or to request data removal, contact us at privacy@awfixer.party. Full policy text can be expanded from the admin dashboard.',
  },
  {
    path: '/legal/terms',
    title: 'Terms of Service',
    description: 'Terms governing use of this website and our services.',
    body: 'These terms of service are managed from the admin dashboard. Replace this placeholder with your full terms.',
  },
  {
    path: '/legal/ccpa',
    title: 'CCPA Notice',
    description: 'California Consumer Privacy Act disclosures.',
    body: 'CCPA-specific disclosures are managed from the admin dashboard. Replace this placeholder with your full notice.',
  },
] as const;

async function clearAllTables(ctx: MutationCtx) {
  const tables = [
    'helpOutSubmissions',
    'helpOutForms',
    'sitePages',
    'tocEntries',
    'formPicklists',
    'siteChrome',
    'newsletterSettings',
  ] as const;

  for (const table of tables) {
    const rows = await ctx.db.query(table).collect();
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
  }
}

/** Assumes tables were cleared or rows are missing; inserts full default dataset. */
async function insertAllDefaultRows(ctx: MutationCtx, now: number) {
  await ctx.db.insert('formPicklists', {
    key: 'default',
    regions: [...DEFAULT_REGIONS],
    states: [...DEFAULT_STATES],
    updatedAt: now,
  });

  await ctx.db.insert('siteChrome', {
    key: 'main',
    brandLabel: DEFAULT_SITE_CHROME.brandLabel,
    navGroups: DEFAULT_SITE_CHROME.navGroups,
    footerBrandName: DEFAULT_SITE_CHROME.footerBrandName,
    footerTagline: DEFAULT_SITE_CHROME.footerTagline,
    footerColumns: DEFAULT_SITE_CHROME.footerColumns,
    copyrightText: DEFAULT_SITE_CHROME.copyrightText,
    updatedAt: now,
  });

  await ctx.db.insert('newsletterSettings', {
    key: 'default',
    enabled: true,
    provider: 'substack_embed',
    heading: 'Newsletter',
    subheading: 'Subscribe for updates. Substack embed can be added from the admin when ready.',
    updatedAt: now,
  });

  for (const role of DEFAULT_HELP_OUT_ROLES) {
    await ctx.db.insert('helpOutForms', {
      roleSlug: role.roleSlug,
      title: role.title,
      description: role.description,
      requirements: role.requirements,
      published: true,
      sortOrder: role.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const p of LEGAL_PAGE_SEED) {
    await ctx.db.insert('sitePages', {
      path: p.path,
      sectionKey: 'legal',
      title: p.title,
      description: p.description,
      bodyJson: docFromPlainText(p.body),
      status: 'published',
      lastUpdatedLabel: 'April 18, 2026',
      updatedAt: now,
    });
  }

  for (const toc of DEFAULT_TOC_ENTRIES) {
    await ctx.db.insert('tocEntries', {
      path: toc.path,
      items: toc.items,
      updatedAt: now,
    });
  }
}

async function seedDefaultsIdempotent(ctx: MutationCtx) {
  const now = Date.now();

  const pick = await ctx.db
    .query('formPicklists')
    .withIndex('by_key', (q) => q.eq('key', 'default'))
    .unique();
  if (!pick) {
    await ctx.db.insert('formPicklists', {
      key: 'default',
      regions: [...DEFAULT_REGIONS],
      states: [...DEFAULT_STATES],
      updatedAt: now,
    });
  }

  const chrome = await ctx.db
    .query('siteChrome')
    .withIndex('by_key', (q) => q.eq('key', 'main'))
    .unique();
  if (!chrome) {
    await ctx.db.insert('siteChrome', {
      key: 'main',
      brandLabel: DEFAULT_SITE_CHROME.brandLabel,
      navGroups: DEFAULT_SITE_CHROME.navGroups,
      footerBrandName: DEFAULT_SITE_CHROME.footerBrandName,
      footerTagline: DEFAULT_SITE_CHROME.footerTagline,
      footerColumns: DEFAULT_SITE_CHROME.footerColumns,
      copyrightText: DEFAULT_SITE_CHROME.copyrightText,
      updatedAt: now,
    });
  }

  const news = await ctx.db
    .query('newsletterSettings')
    .withIndex('by_key', (q) => q.eq('key', 'default'))
    .unique();
  if (!news) {
    await ctx.db.insert('newsletterSettings', {
      key: 'default',
      enabled: true,
      provider: 'substack_embed',
      heading: 'Newsletter',
      subheading: 'Subscribe for updates. Substack embed can be added from the admin when ready.',
      updatedAt: now,
    });
  }

  for (const role of DEFAULT_HELP_OUT_ROLES) {
    const existing = await ctx.db
      .query('helpOutForms')
      .withIndex('by_roleSlug', (q) => q.eq('roleSlug', role.roleSlug))
      .unique();
    if (!existing) {
      await ctx.db.insert('helpOutForms', {
        roleSlug: role.roleSlug,
        title: role.title,
        description: role.description,
        requirements: role.requirements,
        published: true,
        sortOrder: role.sortOrder,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  for (const p of LEGAL_PAGE_SEED) {
    const existingPage = await ctx.db
      .query('sitePages')
      .withIndex('by_path', (q) => q.eq('path', p.path))
      .unique();
    if (!existingPage) {
      await ctx.db.insert('sitePages', {
        path: p.path,
        sectionKey: 'legal',
        title: p.title,
        description: p.description,
        bodyJson: docFromPlainText(p.body),
        status: 'published',
        lastUpdatedLabel: 'April 18, 2026',
        updatedAt: now,
      });
    }
  }

  for (const toc of DEFAULT_TOC_ENTRIES) {
    const existingToc = await ctx.db
      .query('tocEntries')
      .withIndex('by_path', (q) => q.eq('path', toc.path))
      .unique();
    if (!existingToc) {
      await ctx.db.insert('tocEntries', {
        path: toc.path,
        items: toc.items,
        updatedAt: now,
      });
    }
  }
}

/**
 * Wipes every row in all app tables, then inserts the current default dataset.
 * Run from the CLI (requires deploy auth): `bunx convex run internal/helpOut:resetAndSeedDatabase`
 */
export const resetAndSeedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    await clearAllTables(ctx);
    await insertAllDefaultRows(ctx, now);
    return { ok: true as const };
  },
});

/** Idempotent seed for picklists, chrome, newsletter, help-out roles. Admin only. */
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrg(ctx);
    await seedDefaultsIdempotent(ctx);
    return { ok: true as const };
  },
});
