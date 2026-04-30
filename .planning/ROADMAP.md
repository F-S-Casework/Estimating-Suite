# Roadmap: F&S Estimating Suite

**Created:** 2026-04-27
**Core Value:** An estimator can move from ITB to sent proposal without leaving the app or re-entering data.
**Total Requirements:** 49 v1 requirements across 7 phases.

---

## Phase 1: Complete UI Shell

**Goal:** Write views-secondary.jsx so the app loads without errors and all 12 views are navigable.
**Requirements:** SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, SHELL-06, SHELL-07
**Dependencies:** None
**UI hint:** yes
**Complexity:** medium

### Success Criteria
1. App loads in browser with zero console errors or 404s on any file.
2. All 12 nav links render their respective view without a blank screen or crash.
3. CalendarView shows a monthly grid with placeholder job bars and a crew capacity gauge.
4. LibraryView renders a table with a visible search input and category filter controls.
5. ReportsView and MarginView render their respective chart/table scaffolding (sample data acceptable at this phase).

### Key Files
- `project/views-secondary.jsx` — create from scratch; contains CalendarView, LibraryView, ContactsView, DocsView, ReportsView, MarginView
- `project/index.html` — verify script tag for views-secondary.jsx is present and path is correct
- `project/styles.css` — reference only; no changes expected unless new layout tokens are needed

> **Review gate:** After Phase 1 completes, review all 12 views in the browser before proceeding to Phase 2. Confirm layout, navigation, and visual design match expectations.

---

## Phase 2: Supabase Foundation

**Goal:** Configure Supabase, create the full database schema with RLS policies, and add a working login/logout screen so the app is protected behind authentication.
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, DATA-01, DATA-02
**Dependencies:** Phase 1
**UI hint:** yes
**Complexity:** medium

### Success Criteria
1. Navigating to the app when logged out shows a login screen; the rest of the app is not reachable.
2. A user can log in with a valid email/password and land on the Home view.
3. Refreshing the browser after login keeps the user logged in (session persists via localStorage).
4. Clicking the topbar avatar reveals a logout option that returns the user to the login screen.
5. All eight tables (jobs, bids, line_items, contacts, library_items, change_orders, documents, activity_log) exist in Supabase with RLS policies granting full read/write to authenticated users.

### Key Files
- `project/supabase.js` — create; exports initialized Supabase client using CDN-loaded library
- `project/views-auth.jsx` — create; LoginView component with email/password form
- `project/index.html` — add Supabase JS v2 CDN tag; add views-auth.jsx script tag
- `project/app.jsx` — wrap router with auth gate; add onAuthStateChange listener
- `supabase/schema.sql` — create; full DDL for all 8 tables plus RLS policy statements

---

## Phase 3: Live Data Layer

**Goal:** Replace every hardcoded sample data array across all views with live Supabase queries, and add loading and empty states throughout.
**Requirements:** DATA-03, DATA-04, DATA-05, PIPE-01, PIPE-02, PIPE-03, PIPE-04, EST-01, EST-02, EST-03, EST-04, EST-05, LIB-01, LIB-02, LIB-03, LIB-04, LIB-05, CONT-01, CONT-02, CONT-03
**Dependencies:** Phase 2
**UI hint:** yes
**Complexity:** high
**Plans:** 8 plans

Plans:
- [ ] 03-01-PLAN.md — Schema migrations + Spinner/EmptyState components + Fuse.js CDN in index.html
- [ ] 03-02-PLAN.md — supabase.js query helpers (getBids, addBid, updateBidStage, getLineItems, addLineItem, updateLineItem, deleteLineItem, getLibraryItems, upsertLibraryItem, getJobs, getContacts, addContact, updateContact)
- [ ] 03-03-PLAN.md — shell.jsx activeBidId threading + openBid prop passing + dynamic estimator crumb
- [ ] 03-04-PLAN.md — views-home.jsx PipelineView live data + create bid inline form + stage advance buttons
- [ ] 03-05-PLAN.md — views-estimator.jsx live line items + inline CRUD + library insert + bid header
- [ ] 03-06-PLAN.md — views-jobs.jsx JobsView live data
- [ ] 03-07-PLAN.md — views-secondary.jsx LibraryView live data + Fuse.js search + add/edit item form
- [ ] 03-08-PLAN.md — views-secondary.jsx ContactsView live data + add/edit contact form

### Success Criteria
1. Creating a new bid from the Pipeline view persists the record and it appears immediately in the kanban board after reload.
2. Dragging (or advancing) a pipeline card to a new stage saves the updated stage to Supabase.
3. Adding, editing, or deleting a line item in the Estimator updates Supabase; subtotals recalculate automatically without a page reload.
4. Searching or filtering the Pricing Library queries Supabase and returns matching items; inserting an item snapshots its price into the estimate.
5. All views display a spinner while data loads and a descriptive empty state when the table has no rows.

### Key Files (corrected per D-16)
- `project/views-home.jsx` — PipelineView live data (ROADMAP previously listed wrong filename views-primary.jsx)
- `project/views-estimator.jsx` — EstimatorView live line items
- `project/views-jobs.jsx` — JobsView live data
- `project/views-secondary.jsx` — LibraryView and ContactsView live data
- `project/supabase.js` — all query helpers on window.dbHelpers
- `project/shell.jsx` — activeBidId state + Spinner/EmptyState components
- `project/index.html` — Fuse.js CDN tag

---

## Phase 4: PDF Proposal

**Goal:** Implement one-click PDF proposal generation from an estimate using html2canvas and jsPDF, matching the existing F&S Estimator PDF format exactly.
**Requirements:** PDF-01, PDF-02, PDF-03, PDF-04, PDF-05
**Dependencies:** Phase 3
**UI hint:** yes
**Complexity:** high

### Success Criteria
1. A "Generate PDF" button is visible in the Estimator view when a bid has at least one line item.
2. Clicking the button downloads a PDF file automatically; filename contains the job name and current date.
3. The PDF contains a cover page, scope of work section, line-item breakdown, summary pricing table, and T&C section.
4. Visual layout matches the user-supplied F&S Estimator sample PDF (confirmed by side-by-side comparison).
5. The company logo renders correctly in the PDF without CORS errors (base64-inlined).

### Key Files
- `project/views-primary.jsx` — add ProposalPreview hidden render div and "Generate PDF" button to EstimatorView
- `project/pdf.js` — create; contains generateProposal() using html2canvas + jsPDF with page-by-page capture logic
- `project/index.html` — add html2canvas and jsPDF CDN tags
- `project/styles.css` — add `.proposal-print` CSS class using system fonts (Arial, Courier New) for html2canvas compatibility

---

## Phase 5: Cross-View Workflow

**Goal:** Wire the full Pipeline → Estimator → Job handoff → Change Order flow so data moves between views without re-entry.
**Requirements:** PIPE-05, CO-01, CO-02, CO-03, CO-04, CONT-04
**Dependencies:** Phase 3
**UI hint:** yes
**Complexity:** medium

### Success Criteria
1. Marking a bid as "Won" in the Pipeline creates a Job record automatically and the job appears in the Jobs list without manual data entry.
2. A user can create a change order against a job with a number, description, amount, and status (Pending/Approved/Rejected).
3. Approving a change order updates the job's displayed contract value immediately.
4. The Job Detail view shows the original contract value, each CO line, and a revised total.
5. The Job Detail view links to the associated GC contact record, opening the contact's detail on click.

### Key Files
- `project/views-primary.jsx` — add "Mark Won" action to pipeline card; add CO creation form and CO log table to JobDetailView; add GC contact link to JobDetailView
- `project/supabase.js` — add markBidWon() helper (inserts job, updates bid stage); add createChangeOrder() and approveChangeOrder() helpers

---

## Phase 6: Document Storage

**Goal:** Enable file upload and download for job documents using Supabase Storage, with per-job filtering in the Docs view.
**Requirements:** DOC-01, DOC-02, DOC-03, DOC-04
**Dependencies:** Phase 2
**UI hint:** yes
**Complexity:** medium

### Success Criteria
1. A user can select a file in the DocsView (or Job Detail) and upload it to a job; the file appears in the list without a page reload.
2. Uploaded files display their name, type badge (Plans/Specs/Submittals/RFIs), job tag, upload date, and file size.
3. Clicking a file opens or downloads it from Supabase Storage.
4. The file list can be filtered by job and by document type using the existing filter tabs.

### Key Files
- `project/views-secondary.jsx` — add upload button, file input, and upload handler to DocsView; wire filter tabs to Supabase Storage queries
- `project/supabase.js` — add uploadDocument(), listDocuments(), getDocumentUrl() helpers using Supabase Storage API
- `supabase/storage-policy.sql` — create; Storage bucket definition and access policies for authenticated users

---

## Phase 7: Reports & Margin Analytics

**Goal:** Drive ReportsView and MarginView with real Supabase aggregation queries and render live charts using Chart.js.
**Requirements:** RPT-01, RPT-02, RPT-03, RPT-04, RPT-05
**Dependencies:** Phase 3
**UI hint:** yes
**Complexity:** medium

### Success Criteria
1. ReportsView shows a real hit rate percentage calculated from actual bids (won ÷ total submitted).
2. ReportsView shows a backlog chart (Chart.js bar or line) populated from active job contract values.
3. MarginView shows average margin by GC, calculated from won bids linked to each GC contact.
4. MarginView shows average margin by project type derived from bid/job metadata.
5. MarginView shows win rate broken out by estimator from bid records.

### Key Files
- `project/views-secondary.jsx` — replace placeholder data in ReportsView and MarginView with Supabase query results; wire Chart.js chart instances to live data
- `project/supabase.js` — add getHitRate(), getBacklogByMonth(), getMarginByGC(), getMarginByType(), getWinRateByEstimator() aggregation helpers
- `project/index.html` — add Chart.js CDN tag

---

## Summary

| Phase | Name | Requirements | Complexity | Depends On |
|-------|------|-------------|------------|------------|
| 1 | Complete UI Shell | SHELL-01–07 | Medium | None |
| 2 | Supabase Foundation | AUTH-01–04, DATA-01–02 | Medium | Phase 1 |
| 3 | Live Data Layer | DATA-03–05, PIPE-01–04, EST-01–05, LIB-01–05, CONT-01–03 | High | Phase 2 |
| 4 | PDF Proposal | PDF-01–05 | High | Phase 3 |
| 5 | Cross-View Workflow | PIPE-05, CO-01–04, CONT-04 | Medium | Phase 3 |
| 6 | Document Storage | DOC-01–04 | Medium | Phase 2 |
| 7 | Reports & Margin Analytics | RPT-01–05 | Medium | Phase 3 |

---
*Created: 2026-04-27*
*Total v1 requirements mapped: 49 / 49*
