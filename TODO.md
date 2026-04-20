# Traceability — Section I follow-ups

This file is the **working TODO** for [ROADMAP/ROADMAP-SI.md](./ROADMAP/ROADMAP-SI.md) (repository, documentation, and hygiene). Update it when subphases complete or when the next concrete items change.

---

## I.A.1 — Documentation and contracts

### Next items (from Phase I.A.1)

- [x] Ensure [`ROADMAP/WORK.md`](./ROADMAP/WORK.md) remains the source of truth for architecture Q&A; link it from the root [`README.md`](./README.md) (paths must match where `WORK.md` lives).
- [x] Add or verify a short **architecture one-pager** on the root README: Vercel apps → `backboard.awfixer.party` → Convex `http.` / `api.` domains (Mermaid or bullets).
- [x] Document **domain map**: `awfixer.party`, `admin.awfixer.party`, `cms.awfixer.party`, `backboard.awfixer.party`, `auth.awfixer.party`, `http.awfixer.party`, `api.awfixer.party`.
- [ ] **Env checklist templates** — stub or link a repeatable list for local/staging/prod (non-secret names only in-repo).
- [ ] **ADR stubs** — one placeholder per major decision area (auth, ingress, content model, etc.) or link to where ADRs will live.

### Subphase closure (I.A.1.i)

- [ ] After the above, add the **next** documentation/hygiene items below this section (or open issues and link them here).

---

## I.A.2 — Monorepo layout

### Next items (from Phase I.A.2)

- [x] Inventory top-level apps: `partysite`, `admin`, `cms`, `backboard`, `auth`, `mobile`, `admin-mobile` (see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)).
- [x] Define **dependency rules** (who may import whom); recorded in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
- [x] Align root and app-level `package.json` / workspace config so CI can build each surface independently (root Bun `workspaces` + `build:*` scripts; `auth/` stays pnpm-only subtree).

### Subphase closure (I.A.2.i)

- [ ] **Extract shared packages** — list candidates (types, UI tokens, API clients).
- [ ] **Lint boundaries** — eslint/depcruise or equivalent rules between apps.
- [ ] **CI matrix per app** — add `.github/workflows` matrix or link workflow file (table in `docs/ARCHITECTURE.md` until then).
- [ ] After the above, add the **next** monorepo tasks below this section (or open issues and link them here).

---

_Last updated: aligned with ROADMAP Section I — use this file for execution traceability until issues/Linear replace it._
