## Section VIII — Forms, email, and uploads

### Subsection VIII.A — Forms

#### Phase VIII.A.1 — Convex-backed forms + Turnstile

##### Subphase VIII.A.1.i — Spam and storage

- [ ] Store submissions in Convex; admin list/edit (`WORK.md` Q11).
- [ ] Integrate **Turnstile** on public forms.
- [ ] **Create or update an external TODO list** with form builder UX and notification rules.

### Subsection VIII.B — Uploads and AV

#### Phase VIII.B.1 — Quarantine pipeline

##### Subphase VIII.B.1.i — Scan before persist

- [ ] Implement upload path: scan in **Worker or subordinate Worker**; **no durable storage until clean** (`WORK.md` Q32, Round 3 Q39).
- [ ] Evaluate free/low-cost AV SDKs; document choice.
- [ ] **Create or update an external TODO list** with production monitoring for failed scans and retries.

### Subsection VIII.C — Email templates

#### Phase VIII.C.1 — Admin-managed templates

##### Subphase VIII.C.1.i — Resend + awfixer.party

- [ ] Store templates in Convex; edited from admin; HTML assembly in **Convex**; send via **Worker** (`WORK.md` Q12, Q30–31).
- [ ] Configure Resend **bounce/complaint** webhooks into admin/Convex via Backboard.
- [ ] **Create or update an external TODO list** with transactional email coverage (auth, forms, billing events).
