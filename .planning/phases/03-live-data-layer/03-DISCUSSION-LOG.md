# Phase 3: Live Data Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 3-live-data-layer
**Areas discussed:** Estimator ↔ Bid linkage, Pipeline CRUD, Library data seeding, Loading & empty state design

---

## Estimator ↔ Bid Linkage

| Option | Description | Selected |
|--------|-------------|----------|
| Click bid card → opens Estimator pre-loaded | Clicking anywhere on the pipeline card routes to EstimatorView with that bid's ID. No intermediate view. | ✓ |
| Estimator has a bid selector dropdown | Estimator shows a dropdown at top; user picks which bid to work on. | |
| Separate 'Open Estimate' button on bid card detail | Card opens a slide-over with bid details; slide-over has 'Open Estimate' button. | |

**User's choice:** Click bid card → opens Estimator pre-loaded

---

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state with 'Add first line item' prompt | Friendly empty state with call-to-action button. | |
| Empty table, same layout as populated | Same table structure, no rows, no special prompt. | ✓ |
| Pre-populate with common library items | Auto-insert default items when opening new estimate. | |

**User's choice:** Empty table, same layout as populated
**Notes:** Keep it minimal; user finds the Add button themselves.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Rail nav — click Pipeline in sidebar to go back | Standard nav; no back button in Estimator. | ✓ |
| Breadcrumb in topbar with 'back to Pipeline' link | Topbar shows clickable breadcrumb. | |
| Estimator has a bid-switcher in the header | Chip in header lets user switch between bids without leaving Estimator. | |

**User's choice:** Rail nav — standard navigation

---

| Option | Description | Selected |
|--------|-------------|----------|
| App-level state in shell.jsx via activeBidId prop | Managed in shell, passed as props. | ✓ (recommended) |
| localStorage only | Estimator reads from localStorage on mount. | |
| URL hash / query param | Sets window.location.hash. | |

**User's choice:** App-level state (shell.jsx) + also persist in localStorage
**Notes:** User explicitly chose to persist in localStorage too so activeBidId survives page refresh.

---

## Pipeline CRUD

| Option | Description | Selected |
|--------|-------------|----------|
| Click to advance — button or menu on card | Button/dropdown on card to change stage. | ✓ (recommended) |
| Drag and drop between columns | Full kanban DnD. | |
| Click card to open detail, change stage from detail | Stage change inside expanded detail view. | |

**User's choice:** Click to advance — button/dropdown on card

---

| Option | Description | Selected |
|--------|-------------|----------|
| Job name + GC name only | Minimal fields at creation. | |
| Job name + GC + value + project type | Four fields. | |
| Full form at once | All fields upfront. | |

**User's choice (freeform):** Required at creation: Client/GC, Project Name, Bid Due Date, Project Type. Other fields filled later in the Estimator.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Inline form at top of Prospect column | Form card appears in-column. | ✓ (recommended) |
| Modal dialog overlay | Centered modal. | |
| Slide-in drawer from the right | Right-side panel. | |

**User's choice:** Inline form at top of Prospect column

---

| Option | Description | Selected |
|--------|-------------|----------|
| Opens Estimator directly | Card click → Estimator (consistent with earlier decision). | ✓ |
| Opens bid detail slide-over first | Summary panel with 'Open Estimate' button. | |

**User's choice:** Opens Estimator directly (consistent with D-01)

---

## Library Data Seeding

| Option | Description | Selected |
|--------|-------------|----------|
| User imports CSV via Supabase dashboard | App doesn't handle import; user does it in Supabase UI. | ✓ |
| Seed SQL in schema file | INSERT statements for 15 sample rows. | |
| Start completely empty, build via app | No seeding at all. | |

**User's choice:** CSV import via Supabase dashboard

---

| Option | Description | Selected |
|--------|-------------|----------|
| Code, Description, Category, UOM, Material rate, Labor rate | Core fields matching table columns. | ✓ (recommended) |
| Same + Notes field | Adds supplier/expiry notes. | |
| You decide | Claude picks. | |

**User's choice:** Code, Description, Category, UOM, Material rate, Labor rate (no notes in v1)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Description, UOM, Material + Labor rate; qty defaults to 1 | Snapshot copy; no DB reference back to library. | ✓ (recommended) |
| All fields including Code + library_item_id reference | Keeps audit trail to source library item. | |
| You decide | Claude picks. | |

**User's choice:** Description, UOM, Material rate, Labor rate; qty = 1 default; no library_item_id stored

---

## Loading & Empty State Design

| Option | Description | Selected |
|--------|-------------|----------|
| Simple spinner centered in content area | CSS-animated, no library. | ✓ (recommended) |
| Skeleton rows | Gray placeholder bars. | |
| "Loading…" text only | Plain text. | |

**User's choice:** Simple CSS spinner

---

| Option | Description | Selected |
|--------|-------------|----------|
| Centered message + action button | View-specific copy + CTA. | ✓ (recommended) |
| Muted 'No data yet' row in table | Grayed row in table. | |
| Empty table header, no message | Bare table header. | |

**User's choice:** Centered message + action button

---

| Option | Description | Selected |
|--------|-------------|----------|
| Reusable Spinner + EmptyState components | Defined once, used everywhere. | ✓ (recommended) |
| Each view handles its own | Per-view inline markup. | |

**User's choice:** Reusable components

---

## Claude's Discretion

None — user made explicit choices for all questions.

## Deferred Ideas

- Drag-and-drop kanban (PIPE-02 alternative) — too complex without a DnD library; click-to-advance used instead
- Pre-populate estimate from library defaults on new bid open — deferred to v2
- `library_item_id` reference on line items (stale-rate warnings ADV-02) — deferred to v2
- CSV import UI in the app for pricing library — user handles via Supabase dashboard
