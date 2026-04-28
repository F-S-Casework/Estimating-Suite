# Requirements: F&S Estimating Suite

**Defined:** 2026-04-27
**Core Value:** An estimator can move from ITB to sent proposal without leaving the app or re-entering data.

---

## v1 Requirements

### App Shell

- [ ] **SHELL-01**: App loads with all 12 views navigable (no console errors)
- [ ] **SHELL-02**: CalendarView renders with monthly grid, job install bars, crew capacity gauge
- [ ] **SHELL-03**: LibraryView renders searchable pricing table with category filters
- [ ] **SHELL-04**: ContactsView renders with filter tabs (All/GCs/Owners/Subs/Field)
- [ ] **SHELL-05**: DocsView renders per-job file browser with type badges
- [ ] **SHELL-06**: ReportsView renders hit rate chart and backlog table
- [ ] **SHELL-07**: MarginView renders analysis tables by GC, project type, and estimator

### Authentication

- [ ] **AUTH-01**: User can log in with email and password via Supabase Auth
- [ ] **AUTH-02**: User session persists across browser refresh (localStorage token)
- [ ] **AUTH-03**: User sees a login screen when not authenticated; app is not accessible without login
- [ ] **AUTH-04**: User can log out from the topbar avatar

### Data Layer

- [ ] **DATA-01**: Supabase project configured with schema (jobs, bids, line_items, contacts, library_items, change_orders, documents, activity_log)
- [ ] **DATA-02**: RLS policies allow all authenticated users full read/write access
- [ ] **DATA-03**: All views read live data from Supabase (no hardcoded sample arrays in production)
- [ ] **DATA-04**: Loading states shown while Supabase queries are in flight
- [ ] **DATA-05**: Empty states shown when tables return no rows

### Pipeline & Jobs

- [ ] **PIPE-01**: User can create a new bid/prospect from the Pipeline view
- [ ] **PIPE-02**: User can drag a pipeline card between stages (or click to advance stage)
- [ ] **PIPE-03**: Jobs list shows real jobs from Supabase with status, value, install dates
- [ ] **PIPE-04**: Job detail shows contract value, approved COs, net value, install window
- [ ] **PIPE-05**: User can mark a bid as Won, which creates a Job record

### Estimating

- [ ] **EST-01**: User can create a new estimate for a bid
- [ ] **EST-02**: User can add/edit/delete line items in the estimating workbook
- [ ] **EST-03**: Subtotals and grand total (with OH%, profit%, bond%) update automatically
- [ ] **EST-04**: User can search the pricing library and insert an item into the estimate
- [ ] **EST-05**: Line items save to Supabase (persist across sessions)

### Pricing Library

- [ ] **LIB-01**: Pricing library loads all items from Supabase library_items table
- [ ] **LIB-02**: User can search library by keyword (Fuse.js fuzzy search)
- [ ] **LIB-03**: User can filter library by category
- [ ] **LIB-04**: User can add/edit library items
- [ ] **LIB-05**: Library edits update the DB but do not retroactively change existing estimates

### PDF Proposal

- [ ] **PDF-01**: User can generate a PDF proposal from an estimate
- [ ] **PDF-02**: Proposal PDF includes: cover page, scope of work, line-item breakdown, summary pricing, T&C
- [ ] **PDF-03**: PDF format matches existing F&S Estimator proposal (confirmed against user-supplied sample)
- [ ] **PDF-04**: PDF downloads automatically; filename includes job name and date
- [ ] **PDF-05**: Company logo renders in PDF (base64-inlined to avoid CORS)

### Change Orders

- [ ] **CO-01**: User can create a change order against a job
- [ ] **CO-02**: CO shows number, description, amount, status (Pending/Approved/Rejected)
- [ ] **CO-03**: Approving a CO updates the job's contract value
- [ ] **CO-04**: Job detail shows running CO log (original + all COs = revised contract)

### Contacts

- [ ] **CONT-01**: Contacts load from Supabase contacts table
- [ ] **CONT-02**: User can add/edit contact (name, company, role, phone, email)
- [ ] **CONT-03**: Contacts filterable by role (GC/Owner/Sub/Field)
- [ ] **CONT-04**: Job detail links to associated GC contact

### Documents

- [ ] **DOC-01**: User can upload a file to a job (stored in Supabase Storage)
- [ ] **DOC-02**: Uploaded files display in DocsView with name, type, job tag, date, size
- [ ] **DOC-03**: User can download/open a document
- [ ] **DOC-04**: Documents filterable by job and type (Plans/Specs/Submittals/RFIs)

### Reports & Margin

- [ ] **RPT-01**: ReportsView shows real hit rate calculated from bids (won ÷ total sent)
- [ ] **RPT-02**: ReportsView shows backlog chart from active jobs
- [ ] **RPT-03**: MarginView shows average margin by GC (from won bids)
- [ ] **RPT-04**: MarginView shows average margin by project type
- [ ] **RPT-05**: MarginView shows win rate by estimator

---

## v2 Requirements

### Advanced Features (deferred)
- **ADV-01**: Assembly bundles in pricing library (one item = multiple line items)
- **ADV-02**: Stale-rate warnings on library items (>90 days without update)
- **ADV-03**: Email proposal directly from app (v1 = download and send manually)
- **ADV-04**: Bid revision history (v1 = single active version per bid)
- **ADV-05**: Mobile-responsive layout (v1 = desktop-only, 1440px)
- **ADV-06**: Role-based permissions (v1 = all users see everything)
- **ADV-07**: AWI grade fields on proposals
- **ADV-08**: Real-time collaboration indicators

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Desktop-first tool; browser at 1440px |
| PDF takeoff / quantity surveying | Millwork quantities come from shop drawings, not PDF measurement |
| AI auto-estimate | Team trusts estimator judgment; adds complexity without value |
| Multi-step approval workflows | 4-10 people don't need it |
| OAuth / SSO login | Email/password sufficient |
| Offline mode | Requires Supabase connection |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 | Phase 1 | Pending |
| SHELL-02 | Phase 1 | Pending |
| SHELL-03 | Phase 1 | Pending |
| SHELL-04 | Phase 1 | Pending |
| SHELL-05 | Phase 1 | Pending |
| SHELL-06 | Phase 1 | Pending |
| SHELL-07 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| DATA-05 | Phase 3 | Pending |
| PIPE-01 | Phase 3 | Pending |
| PIPE-02 | Phase 3 | Pending |
| PIPE-03 | Phase 3 | Pending |
| PIPE-04 | Phase 3 | Pending |
| PIPE-05 | Phase 5 | Pending |
| EST-01 | Phase 3 | Pending |
| EST-02 | Phase 3 | Pending |
| EST-03 | Phase 3 | Pending |
| EST-04 | Phase 3 | Pending |
| EST-05 | Phase 3 | Pending |
| LIB-01 | Phase 3 | Pending |
| LIB-02 | Phase 3 | Pending |
| LIB-03 | Phase 3 | Pending |
| LIB-04 | Phase 3 | Pending |
| LIB-05 | Phase 3 | Pending |
| PDF-01 | Phase 4 | Pending |
| PDF-02 | Phase 4 | Pending |
| PDF-03 | Phase 4 | Pending |
| PDF-04 | Phase 4 | Pending |
| PDF-05 | Phase 4 | Pending |
| CO-01 | Phase 5 | Pending |
| CO-02 | Phase 5 | Pending |
| CO-03 | Phase 5 | Pending |
| CO-04 | Phase 5 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 5 | Pending |
| DOC-01 | Phase 6 | Pending |
| DOC-02 | Phase 6 | Pending |
| DOC-03 | Phase 6 | Pending |
| DOC-04 | Phase 6 | Pending |
| RPT-01 | Phase 7 | Pending |
| RPT-02 | Phase 7 | Pending |
| RPT-03 | Phase 7 | Pending |
| RPT-04 | Phase 7 | Pending |
| RPT-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-27*
*Last updated: 2026-04-27 after initial definition*
