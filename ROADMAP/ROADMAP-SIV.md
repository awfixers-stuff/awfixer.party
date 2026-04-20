## Section IV — Security, audit, and compliance

### Subsection IV.A — Tamper-evident audit store

#### Phase IV.A.1 — Append-only audit pipeline

##### Subphase IV.A.1.i — Design and export

- [ ] Implement **append-only audit** storage in Convex (or hybrid with object export); periodic export to **cold storage** (`WORK.md` Round 3 Q38, Q40).
- [ ] Define who/what events are audited (admin actions, publishes, billing changes, auth policy changes).
- [ ] **Create or update an external TODO list** with audit review cadence and legal hold procedures.

### Subsection IV.B — Retention and analytics policy

#### Phase IV.B.1 — Seven-year retention

##### Subphase IV.B.1.i — Hot + cold path

- [ ] Design **7-year** retention: Convex for operational window; **archive to R2/Glacier-class** for long-term legal posture (`WORK.md` Q33, Q40).
- [ ] Define IP and behavioral field handling per counsel (`WORK.md` Q34, Q14).
- [ ] **Create or update an external TODO list** with compliance review items (FEC/recordkeeping wording, DPIA or equivalent).
