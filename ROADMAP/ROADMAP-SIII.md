## Section III — Backboard: Convex (`/backboard`) as source of truth

Convex is the **database, document store, and queue handler**. **Authorization** is enforced **only in Convex** (strict TTL / re-auth); the Worker does not duplicate auth rules.

### Subsection III.A — Convex foundations

#### Phase III.A.1 — Schema and modules

##### Subphase III.A.1.i — Core tables

- [ ] Define schema for: users/identity references (Stack-linked), content documents (versioned Tiptap JSON), forms, email templates, analytics events, audit log append-only stream, Stripe linkage, file metadata.
- [ ] Add **idempotency** tables for Stripe webhooks and other ingress (per `WORK.md` Q25).
- [ ] Implement **API versioning** metadata for mobile and web clients (`Accept` / `X-API-Version`).
- [ ] **Create or update an external TODO list** with the next schema migrations and backfill plans.

#### Phase III.A.2 — HTTP actions and queues

##### Subphase III.A.2.i — Ingress endpoints (`http.awfixer.party`)

- [ ] Implement HTTP actions for Stripe webhooks (initial receiver), enqueue work to **Convex-owned queue**, process toward **under one minute** target, **24h** max SLA (`WORK.md` Q37).
- [ ] Wire **Worker → Convex** forwarding conventions; document payload shapes and versioning.
- [ ] Add cron/scheduled processing where needed for queue drain and reconciliation.
- [ ] **Create or update an external TODO list** with the next HTTP action endpoints (forms ingest, analytics batch, exports).

### Subsection III.B — Cloudflare Worker (Backboard edge)

#### Phase III.B.1 — Proxy and routing

##### Subphase III.B.1.i — Single ingress

- [ ] Implement `backboard.awfixer.party` Worker: forward to Convex `http.` / `api.` as appropriate; **redirect bare Backboard root** to `https://awfixer.party` (`WORK.md` Q17).
- [ ] **Resend**: only Worker calls Resend outbound; Convex builds HTML, Worker sends (`WORK.md` Q30–31).
- [ ] Implement **rotating header/key** routing (ingress obscurity + strong crypto per threat model); KV + rotation job; 1Password for third-party secrets (`WORK.md` Q22).
- [ ] **Create or update an external TODO list** with next Worker features (rate limits refinement, DDoS playbook, request signing hardening).

#### Phase III.B.2 — WAF and geo policy

##### Subphase III.B.2.i — Admin hardening

- [ ] Enable **WAF** and **rate limits** at Cloudflare for admin-related routes.
- [ ] Apply **non-US blocking** for admin surfaces **where applicable** (tune per legal/network reality).
- [ ] Document operational runbooks (false positives, allowlisting for staff abroad if needed).
- [ ] **Create or update an external TODO list** with follow-up security tasks (pentest scope, MFA roadmap, hardware-backed keys when admin MFA lands).
