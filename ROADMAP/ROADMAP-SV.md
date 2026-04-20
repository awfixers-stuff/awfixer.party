## Section V — Admin (`/admin`) — `admin.awfixer.party`

Admin is a **standalone Next.js** app on Vercel; **no secrets** in server env beyond agreed non-secret allowlist.

### Subsection V.A — Extraction from partysite

#### Phase V.A.1 — Shell and navigation

##### Subphase V.A.1.i — App bootstrap

- [ ] Remove admin routes from `partysite`; ensure all admin UI lives under `admin/`.
- [ ] Client calls **Backboard only** (not direct Convex) for new features; align with “minimal bypass” policy (`WORK.md` Q4).
- [ ] Stub **`/analytics/**`** for in-house analytics UI.
- [ ] **Create or update an external TODO list** with admin IA and role-based dashboards.

#### Phase V.A.2 — Preview widget

##### Subphase V.A.2.i — Current-page preview

- [ ] Implement **popup preview** for **current page only**, static/minimal surface (`WORK.md` Q27).
- [ ] **Create or update an external TODO list** with preview hardening (CSP, token TTL, iframe boundaries).
