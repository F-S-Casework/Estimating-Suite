---
status: human_needed
phase: 03-live-data-layer
date: 2026-04-30
must_haves_verified: 38
must_haves_total: 38
requirements_covered: 26
requirements_total: 26
human_verification_count: 5
---

# Phase 3 Verification Report — Live Data Layer

## Summary

All 38 automated must-have checks passed. All 26 requirement IDs are covered by implementation. 5 items require human browser testing (they verify runtime behavior against a live Supabase instance).

---

## Must-Have Verification

### 03-01: Schema + Spinner/EmptyState + CDN

| Truth | Status | Evidence |
|-------|--------|----------|
| Spinner renders centered while any view loads | ✓ PASS | `window.Spinner` exported from shell.jsx |
| EmptyState renders heading, body, optional CTA | ✓ PASS | `window.EmptyState` exported from shell.jsx |
| window.Spinner and window.EmptyState globally available | ✓ PASS | grep: `window.Spinner =` and `window.EmptyState =` in shell.jsx |
| Fuse.js CDN tag present in index.html before Babel scripts | ✓ PASS | fuse.umd.min.js loads after supabase.js, before babel scripts |
| All required schema columns exist in supabase/schema.sql | ✓ PASS | gc_name, area_id, oh_pct all present |
| areas, sections, bid_alternates tables with RLS | ✓ PASS | CREATE TABLE IF NOT EXISTS for all 3 in schema.sql |
| line_items has area_id, section_id, drawing_ref, ignore, no_print | ✓ PASS | grep: `area_id` in schema.sql |
| bids has oh_pct, del_pct, ins_pct, V2 metadata + JSONB terms | ✓ PASS | grep: `oh_pct` in schema.sql |
| XLSX CDN present before Fuse.js in index.html | ✓ PASS | xlsx.full.min.js before fuse.umd.min.js in index.html |

### 03-02: Supabase Query Helpers

| Truth | Status | Evidence |
|-------|--------|----------|
| window.dbHelpers exported from supabase.js | ✓ PASS | `window.dbHelpers` in supabase.js |
| getBids, addBid, updateBidStage available | ✓ PASS | 4 matches for bid helpers |
| getAreas, addArea, deleteArea available | ✓ PASS | 4 matches for area helpers |
| getLineItems, addLineItem, updateLineItem, deleteLineItem | ✓ PASS | 5 matches |
| getLibraryItems, upsertLibraryItem | ✓ PASS | 3 matches |
| getContacts, addContact, updateContact | ✓ PASS | 4 matches |

### 03-03: activeBidId Threading

| Truth | Status | Evidence |
|-------|--------|----------|
| AuthenticatedApp tracks activeBidId in state | ✓ PASS | `activeBidId` (2 occurrences) in shell.jsx |
| openBid sets activeBidId and persists to localStorage | ✓ PASS | `openBid` (2) + `fs-active-bid` (2) in shell.jsx |
| PipelineView receives onOpenBid prop | ✓ PASS | prop threading confirmed in views-home.jsx |

### 03-04: PipelineView Live Data

| Truth | Status | Evidence |
|-------|--------|----------|
| PipelineView loads bids from Supabase with spinner | ✓ PASS | getBids + Spinner in views-home.jsx |
| EmptyState when no bids | ✓ PASS | EmptyState in views-home.jsx |
| Card click calls onOpenBid | ✓ PASS | onOpenBid (2 occurrences) in views-home.jsx |
| Stage advance calls updateBidStage | ✓ PASS | updateBidStage + addBid (3 matches) in views-home.jsx |

### 03-05: EstimatorView V2 Base

| Truth | Status | Evidence |
|-------|--------|----------|
| activeBidId prop used to load bid data | ✓ PASS | activeBidId (24 occurrences) in views-estimator.jsx |
| Parallel queries: getAreas, getAllSections, getLineItems | ✓ PASS | 3 matches in views-estimator.jsx |
| centerView state controls panel switching | ✓ PASS | 11 occurrences in views-estimator.jsx |
| V2 cost formula: oh_pct, del_pct, ins_pct | ✓ PASS | 4 matches in views-estimator.jsx |
| Sidebar uses warm paper palette (var(--panel-alt)) | ✓ PASS | 5 occurrences `--panel-alt` in views-estimator.jsx |
| Area qty multiplier displayed | ✓ PASS | area.qty (5 occurrences) in views-estimator.jsx |

### 03-05b: Info + Alternates Panels

| Truth | Status | Evidence |
|-------|--------|----------|
| Info panel with OH%/Del%/Ins% recalculates cost bar | ✓ PASS | handlePctChange + oh_pct (9 matches) in views-estimator.jsx |
| Alternates CRUD panel present | ✓ PASS | alternates (9 matches) in views-estimator.jsx |

### 03-05c: ZZTakeoff + Terms Panels

| Truth | Status | Evidence |
|-------|--------|----------|
| Exclusions and Clarifications panels edit JSONB arrays | ✓ PASS | exclusions + clarifications (11 matches) |
| Terms panel shows all 5 term sections | ✓ PASS | general_terms, warranty, finish_terms (4 matches) |
| ZZTakeoff import button with file picker + XLSX parse | ✓ PASS | showOpenFilePicker + ZZTakeoff + XLSX (12 matches) |

### 03-06: JobsView Live Data

| Truth | Status | Evidence |
|-------|--------|----------|
| JobsView loads jobs from Supabase with spinner | ✓ PASS | getJobs + Spinner (2) in views-jobs.jsx |
| EmptyState when no jobs | ✓ PASS | EmptyState present |
| Hook aliases uS_jobs, uE_jobs to avoid collisions | ✓ PASS | 6 matches in views-jobs.jsx |

### 03-07: LibraryView Live Data

| Truth | Status | Evidence |
|-------|--------|----------|
| LibraryView loads from Supabase | ✓ PASS | getLibraryItems in views-secondary.jsx |
| Fuse.js fuzzy search against loaded items | ✓ PASS | `new Fuse` (2 matches) in views-secondary.jsx |
| upsertLibraryItem saves items | ✓ PASS | 1 match in views-secondary.jsx |

### 03-08: ContactsView Live Data

| Truth | Status | Evidence |
|-------|--------|----------|
| ContactsView loads contacts from Supabase | ✓ PASS | getContacts in views-secondary.jsx |
| addContact and updateContact wired | ✓ PASS | 2 matches in views-secondary.jsx |

---

## Requirements Traceability

| Req ID | Coverage |
|--------|----------|
| DATA-03 | window.dbHelpers helpers in supabase.js; Spinner/EmptyState in shell.jsx |
| DATA-04 | Spinner used in PipelineView, EstimatorView, JobsView, LibraryView, ContactsView |
| DATA-05 | EmptyState used in all live-data views |
| PIPE-01 | PipelineView with getBids live data (03-04) |
| PIPE-02 | Stage advancement via updateBidStage buttons (03-04) |
| PIPE-03 | Job rows in JobsView (03-06) |
| PIPE-04 | Job detail navigation from JobsView (03-06) |
| EST-01 | EstimatorView loads activeBidId (03-05) |
| EST-02 | Line items CRUD via addLineItem/updateLineItem/deleteLineItem (03-05) |
| EST-03 | V2 cost formula: mat+OH+del+ins (03-05) |
| EST-04 | Library insert snapshots price into line_items (03-05, D-12) |
| EST-05 | activeBidId persisted to localStorage (03-03) |
| EST-06 | 3-level hierarchy areas→sections→items (03-05, D-17) |
| EST-07 | Area qty multiplier in cost calc (03-05, D-19) |
| EST-08 | Info panel with all bid metadata fields (03-05b) |
| EST-09 | Exclusions JSONB editor (03-05c) |
| EST-10 | Clarifications JSONB editor (03-05c) |
| EST-11 | Terms panels (general, warranty, finish, hardware, fab) (03-05c) |
| LIB-01 | LibraryView loads from Supabase (03-07) |
| LIB-02 | Fuse.js fuzzy search (03-07) |
| LIB-03 | Category filter tabs (03-07) |
| LIB-04 | Add/edit library item form (03-07) |
| LIB-05 | upsertLibraryItem writes only to library_items, not line_items (03-07) |
| CONT-01 | ContactsView loads from Supabase (03-08) |
| CONT-02 | Add contact form (03-08) |
| CONT-03 | Edit contact form (03-08) |

---

## Phase Success Criteria

| Criterion | Status |
|-----------|--------|
| 1. Creating a new bid persists and appears in kanban | HUMAN — requires live Supabase |
| 2. Advancing stage saves to Supabase | HUMAN — requires live Supabase |
| 3. Line item CRUD updates Supabase; subtotals recalculate | HUMAN — requires live Supabase |
| 4. Library search returns items; insert snapshots price | HUMAN — requires live Supabase |
| 5. All views show spinner while loading, empty state when empty | HUMAN — requires browser test |

---

## Human Verification Required

Before marking Phase 3 complete, test the following in the browser with real Supabase credentials:

1. **Pipeline CRUD** — Click "New Bid", fill required fields, submit. Confirm record persists and appears in the ITB column after browser reload.

2. **Stage advancement** — Click "→ Bid Prep" on a card. Confirm the card moves columns and the change survives reload.

3. **Estimator line items** — Open a bid from Pipeline. Add an area, add a section, add a line item. Edit qty/unit cost. Confirm subtotals update live and the item persists after reload.

4. **Library search + insert** — Navigate to LibraryView. Type a search term — confirm Fuse.js filters results. Open the Estimator with a section selected, click a library item to insert. Confirm the snapshot appears as a line item.

5. **Loading/empty states** — On first load with empty tables, confirm Spinner appears briefly then EmptyState renders with correct copy in: PipelineView, JobsView, LibraryView, ContactsView.

**Developer prerequisite:** Fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `project/supabase.js` and run the migration SQL from `supabase/schema.sql` in Supabase Dashboard > SQL Editor before testing.
