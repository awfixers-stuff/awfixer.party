## Section VII — Partysite (`/partysite`) — public site

**Reads published content only** via Convex-facing APIs through Backboard; **writes** via admin/CMS paths only (`WORK.md` Q10).

### Subsection VII.A — Read models

#### Phase VII.A.1 — Public API consumption

##### Subphase VII.A.1.i — Wire-through Backboard

- [ ] Ensure partysite fetch patterns go **admin → backboard → partysite** and **partysite → backboard → admin** for operational flows as applicable (`WORK.md` intro; detail in deferred Q8).
- [ ] **Create or update an external TODO list** with concrete **admin ↔ partysite operations** once Q8 is filled (caching, revalidation, navigation updates).
