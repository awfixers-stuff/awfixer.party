# Convex backend (AWFixer Party)

This directory holds Convex functions, schema, and HTTP routes for the AWFixer Party Next.js app. Auth uses **Clerk**: Convex validates JWTs from `CLERK_JWT_ISSUER_DOMAIN` (see `auth.config.ts`). Admin-only operations check **Clerk organization IDs** against `ADMIN_CLERK_ORGANIZATION_IDS` (see `lib/adminAuth.ts`).

For Convex API conventions and project-specific rules, read **`_generated/ai/guidelines.md`** before making larger changes.

## Schema overview (`schema.ts`)

| Table                | Role                                                                               |
| -------------------- | ---------------------------------------------------------------------------------- |
| `siteChrome`         | Singleton (`key === "main"`) — nav groups, footer columns, branding copy           |
| `formPicklists`      | Singleton (`key === "default"`) — region/state lists for help-out forms            |
| `helpOutForms`       | One row per role slug — copy, requirements, optional field UI config, publish flag |
| `helpOutSubmissions` | User submissions with review flags and indexes by role, user, reviewed             |
| `sitePages`          | CMS pages (TipTap JSON in `bodyJson`), paths, sections, draft/published            |
| `tocEntries`         | Table of contents for routes not yet backed by `sitePages`, or fallback            |
| `analyticsEvents`    | Pageview/event log for admin analytics                                             |
| `newsletterSettings` | Singleton — Substack embed and related copy (optional)                             |

Defaults and seed content live in `defaults.ts` (plus legal page seeds in `helpOut.ts`). The full reset clears **help-out, site pages, TOC, picklists, site chrome, and newsletter** rows — it does **not** delete **`analyticsEvents`**.

## Modules (by file)

- **`siteChrome.ts`** — Read/update global chrome (nav + footer).
- **`helpOut.ts`** — Help-out forms, picklists, submissions, admin CRUD, rate limits (`lib/formLimits.ts`). Internal **`resetAndSeedDatabase`** — full wipe + reseed (invoked by `bun run convex:reset-db` from repo root).
- **`sitePages.ts`** — Legal/CMS pages by path, admin upsert/delete, published slug lists.
- **`toc.ts`** — TOC queries and admin upsert (`lib/tiptapToc.ts` for heading extraction).
- **`analytics.ts`** — Recording (internal) and admin stats queries (funnels, top pages, etc.).
- **`newsletter.ts`** — Newsletter block settings for the footer.
- **`llmsTxt.ts`** — Payload for `llms.txt`-style discovery (if used by the app).
- **`http.ts`** — HTTP router (e.g. CORS-limited **`/track`** POST for analytics from the production origin).

## CLI

From the repository root:

```bash
bunx convex dev          # sync functions, local dev deployment
bunx convex deploy       # deploy to configured Convex project
```

See [Convex CLI](https://docs.convex.dev/cli) and [Convex + Clerk](https://docs.convex.dev/auth/clerk) for environment setup.

## Reseeding the database (development)

```bash
bun run convex:reset-db
```

This runs `internal/helpOut:resetAndSeedDatabase` and **deletes all rows** in the tables listed above (except analytics) before inserting the default dataset. Use only on non-production deployments when you intend to reset.

For a **non-destructive** fill of missing defaults (admin only), use the public `seedDefaults` mutation from the Convex dashboard or your app after authenticating as an admin.
