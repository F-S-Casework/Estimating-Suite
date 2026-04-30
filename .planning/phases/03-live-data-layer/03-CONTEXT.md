# Phase 3: Live Data Layer - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace every hardcoded sample data array across all views with live Supabase queries. Enable create/edit operations for bids, line items, library items, and contacts. Add loading and empty states throughout. The estimator becomes linked to a specific bid (not a free-standing workbook). No PDF generation, no file upload, no job-from-bid creation — those are Phases 4–6.

</domain>

<decisions>
## Implementation Decisions

### Estimator ↔ Bid Linkage
- **D-01:** Clicking a pipeline card navigates directly to EstimatorView pre-loaded for that bid. No intermediate detail view or slide-over.
- **D-02:** `activeBidId` is tracked in `shell.jsx` state (alongside `active` view). It is also persisted to `localStorage` under key `'fs-active-bid'` so it survives page refresh.
- **D-03:** `shell.jsx` passes `activeBidId` and `setActiveBidId` as props to both PipelineView (to set it) and EstimatorView (to read it). PipelineView calls `setActiveBidId(bid.id)` then `setActive('estimator')` on card click.
- **D-04:** An empty estimate (bid with no line items) shows the same table layout as a populated one — just no rows. No call-to-action prompt, no pre-population from library defaults.
- **D-05:** No back button in Estimator. User returns to Pipeline by clicking "Pipeline" in the Rail nav. Topbar breadcrumb can show the bid name for context, but is not clickable.

### Pipeline CRUD
- **D-06:** Stage advancement uses click-to-advance. Each kanban card has a button or dropdown menu with stage options. No drag-and-drop (requires complex event handling without a DnD library).
- **D-07:** Create bid form appears inline at the top of the Prospect column when user clicks "Ingest ITB" or a "+" button.
- **D-08:** Required fields at creation: Client/GC name, Project Name, Bid Due Date, Project Type. All other fields (estimated value, estimator assignment, notes) are optional and can be populated later.
- **D-09:** Clicking a kanban card opens the Estimator directly (D-01). There is no bid detail view within the Pipeline.

### Library Data Seeding
- **D-10:** Initial pricing library data (the real 1,240-item library) is imported by the user via Supabase dashboard CSV import. The app does not need to handle CSV import. The LibraryView just reads whatever is in `library_items`.
- **D-11:** Add/edit library item form includes: Code, Description, Category, Unit (UOM), Material rate ($/unit), Labor rate ($/unit). No notes field in v1.
- **D-12:** Inserting a library item into an estimate copies: Description, UOM, Material rate, Labor rate as a snapshot into the `line_items` table. Quantity defaults to 1. No `library_item_id` reference is stored — this satisfies LIB-05 (library edits don't retroactively change estimates).

### Loading & Empty State Design
- **D-13:** Loading state: simple CSS-animated spinner centered in the content area. Implemented as a reusable `Spinner` component (no external library).
- **D-14:** Empty state: centered message + call-to-action button, with view-specific copy (e.g., "No bids yet — create your first bid." with the create form trigger). Implemented as a reusable `EmptyState` component accepting `message` and optional `action` props.
- **D-15:** Both `Spinner` and `EmptyState` are defined once (in `shell.jsx` or at the top of a shared section) and used across all views. Exposed via `window.Spinner` and `window.EmptyState` to match the existing `window.Views` / `window.Icon` pattern.

### V2 Estimator Architecture (added 2026-04-30)
- **D-17:** EstimatorView uses a 3-level hierarchy: areas → sections → items. Flat `line_items` is replaced by `areas` table + `sections` table + `line_items` (with `area_id` and `section_id` FK columns). This matches FS_Estimator_v2_1.html exactly.
- **D-18:** Cost formula uses V2 chain — NOT the original OH/profit/bond formula. Chain: `mat = Σ(area.qty × item totals, skipping ignored)`; `oh = mat × oh_pct%`; `matOh = mat + oh`; `del = matOh × del_pct%`; `ins = matOh × ins_pct%`; `total = matOh + del + ins`. Delivery and Install apply to `(material + overhead)`, not to material alone.
- **D-19:** Area `qty` is an integer multiplier (default 1). It represents identical repeated rooms/floors (e.g., `qty=4` on "Exam Room" applies all that area's item costs × 4 in `calcBid`). Shown as "×4" badge in sidebar.
- **D-20:** Hierarchy stored in proper relational tables (`areas`, `sections`) — not embedded JSONB arrays. Chosen for: clean FK cascades on delete, sortable rows, future drag-to-reorder. Tree assembled client-side after 3 parallel queries: `getAreas(bidId)` + `getAllSections(areaIds)` + `getLineItems(bidId)`.
- **D-21:** Exclusions, clarifications, and 5 terms sections (general_terms, warranty, finish_terms, hardware_terms, fab_note) stored as JSONB arrays on the `bids` table. Each item: `{ text, active, sub }`. Chosen for simplicity — no separate tables, fast per-bid access, no join needed.
- **D-22:** ZZTakeoff XLSX import uses `window.showOpenFilePicker` (File System Access API) + XLSX.js CDN (`cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`). Parses Format A (priced, has "Cost Each" column) and Format B (measured, has "Measurement 1" column). Creates areas + a default "Casework" section + line items via existing `dbHelpers`.
- **D-23:** Estimator sidebar uses the app's warm paper palette (`var(--panel-alt)` #F3EEE4 background, `var(--accent)` inset for active state) — NOT the dark navy (#1a2235) from the standalone V2 tool. All views must share one consistent palette.
- **D-24:** `centerView` state in EstimatorView controls which panel the center area shows: `'grid'` (area/section/item table), `'info'` (project info form), `'alternates'`, `'exclusions'`, `'clarifications'`, `'terms'`. Sidebar links set this. Default is `'grid'`.

### File Structure Correction
- **D-16 (IMPORTANT — ROADMAP has wrong filename):** `ROADMAP.md` refers to `project/views-primary.jsx` which does not exist. The actual file layout is:
  - `project/views-home.jsx` — HomeView + **PipelineView** (not views-primary.jsx)
  - `project/views-estimator.jsx` — EstimatorView
  - `project/views-jobs.jsx` — JobsView + JobView + COView
  - `project/views-secondary.jsx` — CalendarView, LibraryView, ContactsView, DocsView, ReportsView, MarginView
  - `project/views-bidhistory.jsx` — BidHistoryView (insight module; lower priority for this phase)
  - Planner must use actual filenames, NOT the names in ROADMAP.md Key Files.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Full v1 requirement list; Phase 3 requirements: DATA-03–05, PIPE-01–04, EST-01–11, LIB-01–05, CONT-01–03
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria (Key Files section has wrong filename — see D-16 above)

### Project Context
- `.planning/PROJECT.md` — Tech stack constraints (CDN-only React, no npm/build step), core value statement
- `CLAUDE.md` — Recommended CDN URLs for all libraries; file size limit (~300 lines per write op)

### Existing Code (must read before planning)
- `project/shell.jsx` — Auth gate, `AuthenticatedApp`, `App`, `Topbar`, `Rail`, view routing via `window.Views`. Phase 3 adds `activeBidId` state here.
- `project/views-home.jsx` — Contains both `HomeView` and `PipelineView` (the kanban board). Pipeline CRUD and stage advancement go here.
- `project/views-estimator.jsx` — `EstimatorView` with hardcoded `estRows`. Needs bid linkage, live line items, and library insert.
- `project/views-jobs.jsx` — `JobsView` + `JobView` + `COView` with hardcoded job rows.
- `project/views-secondary.jsx` — `LibraryView`, `ContactsView`, `CalendarView` with hardcoded arrays. All need Supabase queries.
- `project/supabase.js` — Supabase client (`window.sb`). Phase 3 adds reusable query helpers here.
- `supabase/schema.sql` — Database schema; confirms column names for `bids`, `line_items`, `library_items`, `contacts`, `jobs`, `areas`, `sections`, `bid_alternates` tables.
- `project/uploads/FS_Estimator_v2_1.html` — Source V2 estimator (reference for UI layout, cost formula, ZZTakeoff parser, default exclusions/clarifications/terms boilerplate)

### Prior Phase Decisions
- `.planning/phases/02-supabase-foundation/02-03-SUMMARY.md` — Auth gate pattern, session handling, `window.sb` usage

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `window.Icon` (shell.jsx): Icon set already available — use `Icon.search`, `Icon.plus`, `Icon.filter` etc. in new UI elements
- `window.sb` (supabase.js): Supabase client ready; query pattern is `window.sb.from('table').select('*')`
- `.card`, `.chip`, `.btn`, `.wf` (table) CSS classes (styles.css): All existing UI primitives are available — no new CSS classes needed for basic CRUD forms

### Established Patterns
- `window.Views` registry: All views register themselves via `window.Views = Object.assign(window.Views || {}, {...})` at the bottom of each file
- `window.Icon` / `window.App` pattern: Global registration via `window.*` is the CDN-compatible export pattern — new shared components (`Spinner`, `EmptyState`) should follow this
- React hooks alias pattern: `views-estimator.jsx` uses `uS_est` / `uM_est` to avoid `useState`/`useMemo` name collisions when multiple JSX files are concatenated in the browser — new files should follow this if they use hooks
- File size limit: ~300 lines per write operation (from CLAUDE.md) — large views may need to be split across multiple commits
- `const { useState, useMemo, useEffect, useRef } = React;` destructured at top of each file (views-secondary.jsx pattern)

### Integration Points
- `shell.jsx` `AuthenticatedApp`: Add `activeBidId` and `setActiveBidId` state here; pass down to PipelineView and EstimatorView via the view-render switch block
- `views-home.jsx` PipelineView: Receives `activeBidId` setter; on card click calls setter + routes to estimator
- `views-estimator.jsx` EstimatorView: Receives `activeBidId` as prop; uses it to query `line_items` where `bid_id = activeBidId`
- `project/supabase.js`: Add named query helpers (getBids, getLineItems, getLibraryItems, getContacts, getJobs, addBid, updateBidStage, addLineItem, updateLineItem, deleteLineItem, addContact, upsertLibraryItem) that the views call via `window.sb.*` or direct import

</code_context>

<specifics>
## Specific Ideas

- The existing `window.sb.auth.onAuthStateChange` pattern (shell.jsx) confirms async Supabase integration works in CDN mode — live queries follow the same CDN approach
- "Ingest ITB" button already exists in shell.jsx topbar actions for the pipeline view — it should trigger the inline create-bid form (D-07)
- Kanban stage advancement button/dropdown should use existing `.chip` or `.btn ghost sm` styling for consistency

</specifics>

<deferred>
## Deferred Ideas

- Drag-and-drop kanban (PIPE-02 alternative) — deferred; click-to-advance chosen instead
- Pre-populate estimate with library defaults when opening a new bid — deferred to v2
- `library_item_id` reference on line items (for stale-rate warnings) — deferred to ADV-02 (v2)
- CSV import UI in the app for the pricing library — deferred; user handles via Supabase dashboard
- Drag-to-reorder items within sections — deferred to v2 (Phase 3 is CRUD only)
- Undo/redo stack — deferred to v2
- Supplier/sub items (separate cost rows with markup %) — deferred; not in current schema
- AI-powered document ingestion (finish schedule, spec findings) — deferred to later phase
- PDF proposal generation — Phase 4 (depends on Phase 3 complete)

</deferred>

---

*Phase: 3-Live Data Layer*
*Context gathered: 2026-04-29*
*Last updated: 2026-04-30 — added D-17–D-24 (V2 estimator architecture)*
