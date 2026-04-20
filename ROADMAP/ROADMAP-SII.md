## Section II — Authentication: Clerk removal and Stack Auth

Replace Clerk everywhere; standardize on **Stack Auth** via the **in-repo fork** under `auth/`, without relying on upstream merge cadence (dependencies documented locally).

### Subsection II.A — Remove Clerk

#### Phase II.A.1 — Code and config excision

##### Subphase II.A.1.i — Search and destroy

- [ ] Rip out Clerk SDK usage, middleware, webhook handlers, and env vars across all packages.
- [ ] Remove Clerk from CI secrets templates and deployment dashboards; **no user migration** (greenfield per `WORK.md`).
- [ ] Add a **grep/CI guard** (lint rule or script) so new Clerk references fail the build.
- [ ] **Create or update an external TODO list** with remaining Clerk-adjacent cleanup (dashboard teardown if any accounts remain, DNS, stale docs).

#### Phase II.A.2 — Stack Auth integration

##### Subphase II.A.2.i — Identity provider wiring

- [ ] Wire Stack Auth as IDP for each Vercel app (admin, cms, partysite) per Stack patterns; keep **Vercel env** to non-secret values where possible (`WORK.md` Round 3 Q36).
- [ ] Expose **`auth.awfixer.party`** as the public auth entry; route auth APIs **behind Backboard** when ready (do not leak internal mechanics).
- [ ] Document JWT/JWKS configuration for Convex (`auth.config.ts`) when Backboard/Convex auth path is live.
- [ ] **Create or update an external TODO list** with the next auth tasks (session UX, roles, admin-only flows, SSO testing).
