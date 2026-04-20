# Repo

This repo is currently a mess. We need to do the following:

we need to remove all traces of clerk from the repo. We have decided to go with Stack Auth (`/auth`) as it will give us the flexibility to customize our authentication and subscription setup.

we need to migrate anything Editor and CMS related to the CMS (`/cms`) directory and it will be served as an independent Next.js application at cms.awfixer.party

we need to add convex to backboard (`/backboard`) as it will serve as the single source of truth for all other parts of this application. Auth will use backboard as its datasource, database and api as will all other parts of this application.

we have made the decision to remove admin from partysite (`/partysite`) and move it to a dedicated admin directory (`/admin`) that will be served as an independent Next.js app at admin.awfixer.party

partysite needs to be a Next.js app that can be fully managed via admin but it needs to go admin → backboard → partysite and partysite → backboard → admin as much as possible to protect our API. 

we have been working on our own in house analytics and observability system that will be integrated into backboard (the endpoints) and then able to be viewed in admin at admin.awfixer.party/analytics/**

the features that we need:

- forms
- email (resend?)
- content management types (blog, articles, policy page management and more custom types)
- editor built with tiptap
- no deep linking, the cms, backboard, auth are all headless apps
- backboard needs to be a proxy. To prevent people from identifying how things work we need to create a rotating header and key system so that depending on the headers, key and sender backboard routes the ingress. This will make it so that all calls are generic calls to backboard.awfixer.party and nobody will know who what when where or why.

backboard will be a cloudflare worker, cms + partysite + admin will be hosted via vercel

our convex domains in production are http.awfixer.party (convex http actions) and api.awfixer.party (convex api)

Ask any questions you need; answers will be folded into this document as details for future use.

---

## Open questions (fill in as decisions are made)

### Repo layout and Stack Auth

1. The repository already contains a large `auth/` tree (packages, examples, docs). Should production apps depend on **Stack via npm** only, or do we **keep and evolve an in-repo fork** of Stack? If npm-only, what should happen to the current `auth/` directory (remove, archive, submodule)?

#### A. in repo fork.

2. For **Clerk removal**, besides code and env vars, are there **Clerk Dashboard** settings (webhooks, JWT templates, organizations) that need a documented teardown or migration checklist?

#### A. we are not aiming to preserve anything clerk related so please remove those too.


### Backboard: Convex vs Cloudflare Worker

3. **Division of responsibility**: Is the Cloudflare Worker strictly an **edge proxy** (TLS, rate limits, rotating headers/keys, routing) with **Convex** as the only application/logic layer? Or should any business logic run in the Worker?

#### A. Convex is our database, document store and to a degree queue handler. It is a datasource/datastore. Rendering (SSR/RSC) and APIs run per Round 2 Q17–18: Next.js on Vercel for UI, **all** server/API ingress on the Cloudflare Worker (not public-facing secrets on the client).

4. **Request path**: Please confirm the intended chain: `client / Vercel apps → backboard.awfixer.party (Worker) → http.awfixer.party / api.awfixer.party (Convex)`. Are there any callers that may **bypass** the Worker (e.g. server-side from Vercel with a direct Convex URL), or must **all** Convex traffic go through the Worker in production?

#### A. minimal server side calls can bypass if we find it is absolutely needed. avoid at all costs.

5. **Rotating header and key system**: What is the **threat model** (only obscuring origins from casual inspection vs. full mutual auth)? Do we need **replay protection**, **request signing**, **TTL**, and a **rotation/revocation** story for keys? How are keys distributed to authorized senders (Vercel env, Durable Objects, Secrets Store)?

#### A. We are a political organization and our threat model is maximal and extreme. Take advanced precautions.

### Auth, sessions, and Convex

6. How should **Stack Auth** integrate with Convex: **Convex Auth**, custom **JWT** in `auth.config.ts`, or Stack’s documented **Convex recipe**? Where do **user records** and **session validity** live—Convex only, Stack only, or both with a sync strategy?

#### A. Stack auth as the IDP, SSO and Auth Provider. Convex needs to know about it for things like admin tasks, rate limiting etc but we are not using convex auth outside of that.

7. **Subscriptions and billing**: Stack vs Stripe (or other)—who is the **source of truth** for plan, entitlements, and webhooks, and how is that mirrored into Convex?

#### A. Stack integrations have a Stripe option that we will be enhancing to include features we do not currently have. It currently uses Stripe Connect; we will modify it to use our Stripe account without the Connect option (billing, not payouts).

### Admin, CMS, and partysite flows

8. The doc says traffic should go **admin → backboard → partysite** and **partysite → backboard → admin**. Please enumerate the **concrete operations** (e.g. publish page, update navigation, invalidate cache, moderation) for each direction so we can design APIs and avoid unnecessary round-trips.

#### A. will discuss later.

9. **CMS preview and drafts**: Will editors need **preview** of unpublished content on partysite? If yes, how is that authenticated without “deep linking” the CMS into the public site?

#### A. Embed the preview option as a popup widget in the admin site.

10. **Content API**: Should partysite read **only published** documents via Convex queries, with **all writes** going through admin (or CMS) via backboard?

#### A. Yes.

### Features: forms, email, editor

11. **Forms**: Expected storage (Convex tables), admin visibility, anti-spam (e.g. Turnstile), and file uploads if any?

#### A. Convex. Admin will be able to see and edit forms. Yes to Turnstile. File uploads are a needed feature but not expected to be used heavily at first.

12. **Email (Resend)**: Confirm **sending domain(s)**, whether **templates** live in repo vs Resend dashboard, and which events trigger mail (auth, form submit, billing, digest).

#### A. We will use awfixer.party and the templates will be managed via the admin dashboard and stored on Convex.

13. **Tiptap / rich content**: Storage format (**Portable Text-like JSON**, HTML, or ProseMirror JSON only), sanitization strategy, and **asset hosting** (Convex file storage vs external).

#### A. JSON stored via Convex and able to be structured differently depending on the client (mobile web, mobile app, etc)

### Analytics and compliance

14. **Analytics/observability**: Event schema (required fields), **PII** policy, retention, and whether events are **admin-only** or also used for product analytics on partysite.

#### A. We want max data (not PII but things like click thrus, session time, regions, form abandonment, time per question/field) and it needs to go into the admin dashboard where it will be used. We do not plan on doing product analytics. as a PAC/Political Party we are legally required to retain this information.

### Other clients

15. **`mobile/` and `admin-mobile/`**: Will they use the **same** backboard entrypoint and contracts as the web apps?

#### A. Yes. Their headers will be different as the needed content structure is different.

### Typos / naming (for consistency)

16. Confirm branding: **Stack Auth** (not “stack aith”), and preferred capitalization for **Backboard** in docs and env var prefixes.

#### A. Yes.

---

## Round 2 — follow-up questions (fill in as decisions are made)

### Architecture: Worker vs Vercel (critical for implementation)

17. Next.js apps on **Vercel** normally execute **SSR, RSC, and route handlers** on Vercel’s runtime, not inside a **Cloudflare Worker**. Your answer to Q3 suggests the Worker runs “SSR, RSC, API.” Please pick or describe the **actual split**:
    - **(a)** Vercel runs Next (pages, RSC, server actions where used); **Worker is the BFF/proxy** in front of Convex (`http.` / `api.`) and public APIs; **or**
    - **(b)** You are standardizing on a **non-Vercel** hosting pattern for some apps (e.g. Workers + separate rendering), **or**
    - **(c)** Another concrete layout (diagram or bullet list is fine).

#### A. **(a)** Vercel runs Next (pages, RSC). The Worker is the BFF/proxy in front of Convex and public APIs. Offload rendering inputs and **environment secrets** to infrastructure that is not exposed to the public (Worker + back end; not client-visible). **Direct visits to `backboard.awfixer.party` must HTTP redirect to `https://awfixer.party`.**

18. For **API routes** and **server-only** code today: should **all** new server endpoints live on the **Worker** (single ingress) while Next uses mostly client components + Worker fetch, or will Next **Route Handlers** remain for some surfaces?

#### A. All new server endpoints on the Worker (single ingress). Next should not rely on Route Handlers for new features unless bypass is explicitly approved (see Q4).

### Stack fork and Clerk removal

19. For the **in-repo Stack fork**: who **owns merges from upstream**, what is the **upgrade cadence**, and do you require **pinned internal releases** (version tags in this repo) for reproducible deploys?

#### A. No upstream merge process. Only dependency updates as needed, **documented in this repo**. We are not going to rely on upstream Stack releases for day-to-day workflow.

20. **Clerk removal**: confirm there is **no** requirement to **migrate existing end users** (greenfield vs production cutover). If production exists, note **identity mapping** expectations (new Stack user ↔ old Clerk ID) or “no migration.”

#### A. no there is not.

### Maximum threat model (turn into requirements)

21. Beyond rotating headers/keys, which **must-haves** apply: **immutable audit logs**, **WAF/rate limits at Cloudflare**, **geo/IP allowlists for admin**, **separate admin network or VPN**, **hardware security modules** for signing keys, **third-party pentest** gate before launch?

#### A. WAF and rate limits; tracking for admin and **blocking non-US** traffic to admin surfaces where applicable; hardware-backed security will be introduced when admin apps can serve as MFA.

22. **Key material**: will signing keys live in **Cloudflare Secrets**, **KV with rotation job**, or **external** vault with Worker fetch? Any **compliance** framework you need to align wording with (even informally)?

#### A. **KV** with a rotation job for signing/header material; **1Password** for non-header and server-generated third-party keys (Resend, Stripe, etc.).

### Stack ↔ Convex ↔ Worker

23. **JWT validation**: document the **issuer**, **audience**, **JWKS URL** (or equivalent) from Stack that Convex will trust in `auth.config.ts`, and whether the **Worker** also validates the same tokens for ingress or uses a **different** client credential model.

#### A. **`auth.awfixer.party`** is the auth entry users and integrations see. JWT/JWKS and issuer/audience conventions are configured as part of Stack + Convex; an **auth API** is expected and **must sit behind Backboard** (not direct public exposure of internal auth mechanics).

24. **Admin tasks in Convex**: when you say Convex must know Stack for “admin tasks, rate limiting,” should **authorization** be enforced **only in Convex** (recommended) with the Worker trusting upstream auth headers minimally, or **duplicated** at the Worker edge.

#### A. **Only in Convex**, with strict TTL and re-auth policy. The Worker must not duplicate authorization rules.

### Stripe and billing

25. **Stripe webhooks**: should the **canonical** receiver be **Convex HTTP actions** (`http.awfixer.party`), the **Worker**, or **both** (one forwards to the other)? Any requirement for **webhook idempotency** storage keyed in Convex?

#### A. **Both** Worker and Convex participate: **Stripe → Webhook → Convex HTTP endpoint → queue → Backboard processing → account/entitlement revalidation.** Idempotency keys stored in Convex (explicit requirement when implementing).

26. **Connect → direct account**: do we **delete** Connect applications/accounts in Stripe, or only **stop using** Connect in code while legacy objects remain dormant?

#### A. delete.

### Preview (admin popup)

27. **Preview widget**: should preview render **partysite** inside an **iframe** with a **short-lived signed token** in the URL, or **fetch rendered HTML** from backboard and inject into the popup? Any **CSP** constraints on `admin.awfixer.party` vs `partysite` origins?

#### A. **Current page only**; keep the surface **static/minimal** for security (no full-site preview requirement in v1).

### Content and Tiptap

28. **Canonical JSON**: one **versioned** Tiptap/ProseMirror document shape in Convex with **server-side transforms** per client, or **multiple stored variants** per channel?

#### A. one versioned copy.

29. **Sanitization**: where is **HTML or text extraction** enforced—in Convex mutations, Worker, or client only (which is unsafe for untrusted editors)?

#### A. All three: **client** validation for UX, **Worker** sanitization on ingress, **Convex mutations** as the authoritative final check.

### Email (Resend + admin-stored templates)

30. **Send path**: may **only** the Worker call Resend, **or** may Convex actions call Resend directly (still behind Worker for public ingress)? How are **bounces/complaints** surfaced back into admin?

#### A. **Only the Worker** calls Resend. Configure **bounce/complaint webhooks** in Resend (and route outcomes into admin/Convex via Backboard as implemented).

31. **Template rendering**: is final HTML assembled in **Worker**, **Convex**, or **admin at save time** with stored snapshots?

#### A. **Convex** assembles final HTML from templates/content stored in Convex; Worker sends (see Q30).

### Forms and uploads

32. **Upload pipeline**: browser → **signed URL** (Convex storage) vs **post through Worker**? Any **antivirus/malware** scanning requirement before blobs are accepted for PAC compliance?

#### A. yes scan for av using a worker job. We might need to find an sdk for doing that programatically.

### Analytics and legal retention

33. **Retention**: you must retain for legal reasons—what is the **minimum** period (if known), **export format** for regulators or counsel, and should **cold storage** (e.g. object archive) back **Convex** for multi-year retention?

#### A. 7 years.

34. **“Not PII” definition**: confirm whether **IP addresses** are **hashed/truncated**, whether **fingerprint-like** signals are allowed, and **geo** resolution cap (country vs region vs city).

#### A. Treat **“not PII”** as primarily about **IP** (still define retention/handling in policy). **Keep other behavioral/telemetry fields** as approved for analytics (subject to counsel review).

### Mobile and API evolution

35. **Contract versioning**: will mobile use **explicit API version headers** (e.g. `Accept`/`X-API-Version`) so partysite and mobile can diverge without breaking older apps?

#### A. **Explicit API version headers** (`Accept` / `X-API-Version` or agreed equivalent). Older app builds may be **invalidated/broken** intentionally when versions move; versioning is still required for controlled rollouts.

---

## Round 3 — follow-up questions

36. **Next.js on Vercel still holds non-public server secrets** for build/runtime (e.g. server env for RSC). Confirm which **classes of secrets** live only in **Worker/1Password/Convex** vs which may exist on **Vercel** (e.g. public `NEXT_PUBLIC_*` only).

#### A. On **Vercel**, restrict to **`NEXT_PUBLIC_*` and other strictly non-secret build/runtime values** as agreed. **Sensitive credentials** (API keys, signing material, third-party secrets) live in **Worker**, **1Password**, and/or **Convex** (and related infra), not in Vercel server env. *(Implementation: enumerate allowed Vercel env names in checklist per app.)*

37. **Stripe webhook + queue**: which system owns the **queue**—Convex (scheduled/cron) vs Worker (Queues) vs external—and what is the **SLA** for “account revalidated after webhook”?

#### A. **Convex** owns the queue/processing. **SLA:** hard ceiling **24 hours**; **target** revalidation **under 1 minute**.

38. **Immutable audit logs** were listed as optional in Round 2 Q21 but not selected. Do you want a **separate tamper-evident audit store** (e.g. append-only table + periodic export) for admin/changes, or **WAF + Convex history** enough for v1?

#### A. **Yes** — implement a **separate tamper-evident audit store** (append-only + periodic export), not only WAF + ad hoc Convex history.

39. **AV scanning**: preferred vendors or constraints (budget, must run in Worker, async quarantine until clean)?

#### A. Prefer **free/low-cost** options where viable. Run scanning **in the Worker or a dedicated subordinate Worker**; **do not persist uploads to durable storage until verified clean** (quarantine until pass).

40. **7-year retention**: confirm if **Convex-only** is acceptable for the full window or if **archive/export to cold storage** (S3/R2 Glacier) is required by counsel/compliance.

#### A. Prefer **cold storage / archive** (e.g. R2, Glacier-class tiers) for **cost and legal posture**; design exports so counsel/compliance can point at long-lived object storage, not Convex alone for the full seven years.

---

## Still open (from Round 1)

8. **Admin ↔ partysite concrete operations** — *deferred (“will discuss later”).* Replace with an explicit operation list when ready.

_\(Add Round 4 here if new topics arise.\)_
