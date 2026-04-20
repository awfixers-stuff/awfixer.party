## Section I — Repository, documentation, and hygiene

Establish a navigable monorepo, canonical env naming, and change discipline before large refactors.

### Subsection I.A — Documentation and contracts

#### Phase I.A.1 — Canonical references

##### Subphase I.A.1.i — Living docs

- [ ] Ensure [`WORK.md`](./WORK.md) remains the source of truth for architecture Q&A; link it from the root [`README.md`](./README.md).
- [ ] Add a short **architecture one-pager** (Mermaid or bullet diagram) to [`README.md`](./README.md): Vercel apps → `backboard.awfixer.party` → Convex `http.` / `api.` domains.
- [ ] Document **domain map**: `awfixer.party`, `admin.awfixer.party`, `cms.awfixer.party`, `backboard.awfixer.party`, `auth.awfixer.party`, `http.awfixer.party`, `api.awfixer.party`.
- [ ] **Create or update an external TODO list** with the next documentation and hygiene tasks (env checklist templates, ADR stubs per major decision).

#### Phase I.A.2 — Monorepo layout

##### Subphase I.A.2.i — Package boundaries

- [ ] Inventory top-level apps: `partysite`, `admin`, `cms`, `backboard`, `auth`, `mobile`, `admin-mobile` (adjust names if directories change).
- [ ] Define **dependency rules** (who may import whom); record in README or a short `docs/ARCHITECTURE.md`.
- [ ] Align root and app-level `package.json` / workspace config (pnpm, bun, npm workspaces) so CI can build each surface independently.
- [ ] **Create or update an external TODO list** with the next monorepo structure tasks (extract shared packages, lint boundaries, CI matrix per app).
