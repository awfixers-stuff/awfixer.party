# Awfixer Party monorepo

This repository holds the applications and shared code for **Awfixer Party** web and mobile surfaces. Work is organized around a **headless** architecture: public sites and admin tools talk to a single **Backboard** (Cloudflare Worker) that sits in front of **Convex**, which is the **source of truth** for data, queues, and server-side logic.

**Living documents**

| File | Purpose |
|------|--------|
| [`WORK.md`](./WORK.md) | Architecture decisions, Q&A, and constraints (source of truth for “why”). |
| [`ROADMAP.md`](./ROADMAP.md) | Phased engineering plan with checklists and subphases. |

---

## What we are building

- **Partysite** (`partysite/`) — Public **Next.js** site on Vercel, managed from admin. Reads **published** content only; writes go through admin/CMS via Backboard ([`WORK.md`](./WORK.md) Q10).
- **Admin** (`admin/`) — **Next.js** app at **admin.awfixer.party**: operations, in-house **analytics/observability** UI under `/analytics/**`, forms management, email template management, content orchestration. Stripped out of partysite and hosted as its own app.
- **CMS** (`cms/`) — **Next.js** at **cms.awfixer.party** for editorial workflows: Tiptap-based editor, content types (blog, articles, policies, extensible types). Headless; no deep-linking requirement to other apps ([`WORK.md`](./WORK.md)).
- **Backboard** — Not a single directory only: **Convex** deployment rooted in `backboard/` **plus** a **Cloudflare Worker** at **backboard.awfixer.party** that proxies and secures ingress. Convex production domains: **http.awfixer.party** (HTTP actions) and **api.awfixer.party** (Convex API).
- **Auth** (`auth/`) — **Stack Auth** maintained as an **in-repo fork** for flexibility (subscriptions, customization). **Clerk is removed**; there is **no legacy user migration** ([`WORK.md`](./WORK.md)). Public auth entry is **`auth.awfixer.party`**; auth APIs are meant to sit **behind Backboard**.
- **Mobile** (`mobile/`, `admin-mobile/`) — Same Backboard contracts as web; **versioned API headers** and different response shaping per client ([`WORK.md`](./WORK.md) Q15, Q35).

---

## Architecture at a glance

```mermaid
flowchart LR
  subgraph vercel [Vercel]
    PS[partysite]
    AD[admin]
    CM[cms]
  end
  subgraph cf [Cloudflare]
    BB[backboard.awfixer.party Worker]
  end
  subgraph convex [Convex]
    HTTP[http.awfixer.party]
    API[api.awfixer.party]
  end
  PS --> BB
  AD --> BB
  CM --> BB
  BB --> HTTP
  BB --> API
```

- **Next.js** runs on **Vercel** (UI, RSC/SSR for pages). **New server APIs** are intended to live on the **Worker** (single ingress); avoid Vercel Route Handlers for new features unless an approved exception applies ([`WORK.md`](./WORK.md) Q17–18).
- **Secrets:** sensitive keys live in **Worker, 1Password, Convex**, and related infra — **not** in Vercel server env beyond explicitly allowed non-secret configuration ([`WORK.md`](./WORK.md) Round 3 Q36).
- Visiting **backboard.awfixer.party** directly should **redirect** to **https://awfixer.party** ([`WORK.md`](./WORK.md) Q17).

---

## Features (high level)

| Area | Direction |
|------|-----------|
| **Auth** | Stack Auth (IDP); Convex validates tokens for privileged work; authorization **only in Convex** ([`WORK.md`](./WORK.md) Q24). |
| **Content** | Versioned **Tiptap JSON** in Convex; sanitize client → Worker → Convex ([`WORK.md`](./WORK.md) Q28–29). |
| **Forms** | Convex storage; **Turnstile**; uploads scanned before durable storage ([`WORK.md`](./WORK.md) Q11, Q32, Round 3 Q39). |
| **Email** | **Resend** from **awfixer.party**; templates in Convex, edited in admin; **HTML assembled in Convex**, sent by **Worker** ([`WORK.md`](./WORK.md) Q12, Q30–31). |
| **Billing** | Stripe via Stack-integrated path; **Connect removed/deleted**; webhooks **Convex + Worker**, queue in Convex, idempotent ([`WORK.md`](./WORK.md) Q25–26, Q37). |
| **Analytics** | Rich **non-PII** behavioral metrics where policy allows; **7-year** retention with **cold/archive** storage emphasis ([`WORK.md`](./WORK.md) Q14, Q33, Round 3 Q40). |
| **Audit** | **Tamper-evident append-only** audit store with export ([`WORK.md`](./WORK.md) Round 3 Q38). |
| **Security** | WAF/rate limits; ingress routing with **rotating keys** (KV + rotation); **maximal** threat posture ([`WORK.md`](./WORK.md) Q5, Q21–22). |

---

## Repository layout (top level)

```
awfixerparty/
├── README.md          # This file
├── WORK.md            # Decisions and Q&A
├── ROADMAP.md         # Phased plan
├── admin/             # admin.awfixer.party
├── cms/               # cms.awfixer.party
├── partysite/         # Public site
├── backboard/         # Convex project + backboard-related code
├── auth/              # In-repo Stack Auth fork
├── mobile/
├── admin-mobile/
└── …
```

Individual apps may have their own README (for example `admin/README.md`, `cms/README.md`).

---

## Development

The root [`package.json`](./package.json) is minimal. Use each app’s **own** package manager scripts (`npm run dev`, `bun dev`, etc.) and Convex/Cloudflare CLIs as wired in **backboard** and deployment docs when they exist.

For **what to do next**, follow [`ROADMAP.md`](./ROADMAP.md) and keep **`WORK.md`** updated when decisions change.

---

## Contributing and tracking work

- Prefer **small PRs** per section of the roadmap.
- Each roadmap **subphase** ends with: **create or update an external TODO list** (GitHub Issues, Linear, etc.) so the next chunk of work is visible outside this repo.
- Questions that still need product/engineering workshop are called out in [`WORK.md`](./WORK.md) (e.g. **admin ↔ partysite concrete operations**, Q8).

---

_Legal/compliance copy (FEC, retention, PII boundaries) must be reviewed by counsel; [`WORK.md`](./WORK.md) captures intent only._
