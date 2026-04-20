## Section VI — CMS (`/cms`) — `cms.awfixer.party`

Headless CMS; **no deep linking** per product stance; editors use CMS as its own app.

### Subsection VI.A — Migration of editor/CMS code

#### Phase VI.A.1 — Content types and Tiptap

##### Subphase VI.A.1.i — Canonical content model

- [ ] Migrate editor/CMS-related code into `cms/`.
- [ ] Store **one versioned** Tiptap/ProseMirror JSON document in Convex; transforms per client (`WORK.md` Q28).
- [ ] Sanitization: **client + Worker + Convex** final check (`WORK.md` Q29).
- [ ] **Create or update an external TODO list** with content type backlog (blog, articles, policy pages, custom types) and publishing workflow.

#### Phase VI.A.2 — Assets

##### Subphase VI.A.2.i — Convex file storage

- [ ] Define asset pipeline (Convex storage, CDN URLs via Worker if needed).
- [ ] **Create or update an external TODO list** with image optimization and permissions for uploads.
