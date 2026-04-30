## RESEARCH COMPLETE

# Phase 3: Live Data Layer — Research

**Date:** 2026-04-30
**Phase:** 3 — Live Data Layer

---

## 1. Schema Audit — Gaps That Must Be Fixed

The existing `supabase/schema.sql` was created in Phase 2 before Phase 3 decisions were finalized. Two tables need additional columns:

### bids table — missing fields
Current columns: `id, number, name, stage, due_date, total, notes, created_at, updated_at`

**Missing:** `gc_name text` (Client/GC name — required at creation per D-08) and `project_type text` (required at creation per D-08).

**Fix:** Add these columns via Supabase dashboard SQL editor or a migration file:
```sql
ALTER TABLE bids ADD COLUMN IF NOT EXISTS gc_name text;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS project_type text;
```

### library_items table — missing fields
Current columns: `id, category, description, unit, unit_cost, notes, created_at, updated_at`

**Missing:** `code text` (item code like CW-101), `material_cost numeric(12,2)`, `labor_cost numeric(12,2)`. The discuss-phase decided these are separate fields (D-11, D-12). The existing `unit_cost` captures total but not the split.

**Fix:**
```sql
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS material_cost numeric(12,2);
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS labor_cost numeric(12,2);
```

### bids stage values — alignment needed
Schema CHECK: `('ITB', 'Takeoff/Pricing', 'Review', 'Submit', 'Won', 'Lost')`
Hardcoded kanban cols: `'lead', 'qty', 'price', 'qc', 'sent'`

The planner must use the DB-defined stages (ITB, Takeoff/Pricing, Review, Submit, Won, Lost), not the UI display names. Display labels can differ from DB values.

---

## 2. Supabase CDN Query Patterns

The `window.sb` client is already initialized. Patterns for this phase:

### Basic query (all rows)
```js
const { data, error } = await window.sb.from('bids').select('*').order('created_at', { ascending: false });
```

### Filtered query
```js
const { data } = await window.sb.from('line_items').select('*').eq('bid_id', activeBidId).order('sort_order');
```

### Insert
```js
const { data, error } = await window.sb.from('bids').insert({ name, gc_name, due_date, project_type, stage: 'ITB', number: `B${year}-${seq}` }).select().single();
```

### Update
```js
const { error } = await window.sb.from('bids').update({ stage: 'Takeoff/Pricing' }).eq('id', bidId);
```

### Delete
```js
const { error } = await window.sb.from('line_items').delete().eq('id', lineItemId);
```

### Upsert (line item edit)
```js
const { error } = await window.sb.from('line_items').upsert({ id, bid_id, description, qty, unit, unit_cost }).eq('id', id);
```

**Note on generated columns:** `line_items.total` is `GENERATED ALWAYS AS (qty * unit_cost) STORED`. Do NOT include `total` in INSERT/UPDATE payloads — Supabase will reject it.

---

## 3. React Data Fetching Pattern (CDN, no hooks library)

Standard `useState` + `useEffect` pattern — no SWR/React Query available:

```jsx
function MyView() {
  const [data, setData] = useState(null);   // null = loading, [] = empty
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: rows, error: err } = await window.sb.from('table').select('*');
      if (!cancelled) {
        if (err) setError(err.message);
        else setData(rows);
      }
    }
    load();
    return () => { cancelled = true; };  // cleanup prevents state updates on unmounted component
  }, []);  // empty deps = load once on mount

  if (data === null) return <window.Spinner />;
  if (error) return <div style={{color:'var(--bad)', padding:24}}>{error} — <button onClick={() => setData(null)}>Retry</button></div>;
  if (data.length === 0) return <window.EmptyState heading="No items" body="..." />;
  return <table>...</table>;
}
```

**Key invariant:** `null` = loading, `[]` = empty, `[...]` = data. Never start with `[]` or you'll flash an empty state before the query completes.

---

## 4. activeBidId Threading (shell.jsx)

`AuthenticatedApp` in shell.jsx currently manages only `active` (the current view). Phase 3 adds `activeBidId`:

```jsx
function AuthenticatedApp({ session }) {
  const [active, setActive] = useState(() => {
    try { return localStorage.getItem('fs-view') || 'home'; } catch { return 'home'; }
  });
  const [activeBidId, setActiveBidId] = useState(() => {
    try { return localStorage.getItem('fs-active-bid') || null; } catch { return null; }
  });

  const go = (id) => { setActive(id); try { localStorage.setItem('fs-view', id); } catch {} };
  const openBid = (bidId) => {
    setActiveBidId(bidId);
    try { localStorage.setItem('fs-active-bid', bidId); } catch {}
    go('estimator');
  };
  // ...
  // Pass to views:
  case 'pipeline': return <PipelineView onOpenBid={openBid} />;
  case 'estimator': return <EstimatorView activeBidId={activeBidId} />;
}
```

The `window.__go` side-channel already exists for HomeView ("View pipeline →" button). The `openBid` function is a cleaner pattern for bid navigation.

### Estimator topbar breadcrumb
When `activeBidId` is set, the crumb should show the bid name. This requires either:
- Passing `activeBid` (the full bid object, not just ID) from shell — simpler
- Or having EstimatorView fetch bid metadata separately — causes an extra network call

**Recommended:** Pass `activeBid` (full object) to shell after PipelineView fetches bids.

---

## 5. File Size Constraints and Split Strategy

The 300-line limit per write operation applies to each JSX file. Current sizes:
- `views-secondary.jsx`: 537 lines — **OVER LIMIT**, must be written in chunks
- `views-home.jsx`: 253 lines — near limit after adding Pipeline CRUD
- `views-jobs.jsx`: 373 lines — over limit, must be split
- `views-estimator.jsx`: 282 lines — near limit
- `shell.jsx`: 199 lines — OK

**Approach for oversized files:** Write in two passes:
1. First pass: top half (lines 1–280ish) with Write tool
2. Second pass: append remaining using Edit tool (add to end) or split into two Write operations at a natural boundary (component boundaries)

---

## 6. Fuse.js Integration (LIB-02)

CDN: `https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.umd.min.js`

Must be added to `project/index.html` as a script tag **before** Babel JSX files.

Usage pattern in LibraryView:
```jsx
const fuse = useMemo(() => {
  if (!libraryItems.length) return null;
  return new window.Fuse(libraryItems, {
    keys: ['description', 'code', 'category'],
    threshold: 0.3,
    includeScore: true,
  });
}, [libraryItems]);

const results = useMemo(() => {
  if (!searchQ || !fuse) return libraryItems;
  return fuse.search(searchQ).map(r => r.item);
}, [searchQ, fuse, libraryItems]);
```

`window.Fuse` is the UMD global. The library is small enough (~25 KB) to load before Babel.

---

## 7. Bid Number Generation

The `bids.number` column is `UNIQUE NOT NULL`. The UI shows numbers like `B26-041`. Auto-generation strategy:
```js
const year = new Date().getFullYear().toString().slice(-2);
const seq = String(Date.now()).slice(-3);  // last 3 digits of timestamp — collision-safe for 4-10 users
const number = `B${year}-${seq}`;
```

Alternative: query `MAX(number)` and increment. More robust but requires an extra round-trip. For 4-10 users, timestamp suffix is sufficient.

---

## 8. Spinner and EmptyState — Shared Component Location

These components should be defined at the TOP of `shell.jsx` (before `Topbar`, before `AuthenticatedApp`) and registered on `window`:

```jsx
// In shell.jsx, before Topbar:
function Spinner() { ... }
function EmptyState({ heading, body, action }) { ... }
window.Spinner = Spinner;
window.EmptyState = EmptyState;
```

Since all JSX files are loaded sequentially in `index.html` and `shell.jsx` loads first (it wraps everything), these will be available to all view files.

**CSS for spinner** goes in `styles.css` — a single `.spinner` class + `@keyframes spin` animation.

---

## 9. PipelineView Stage Mapping

| DB stage | Display label | Kanban col position |
|----------|---------------|---------------------|
| ITB | Lead / ITB received | 1 |
| Takeoff/Pricing | Quantities / Pricing | 2 |
| Review | Review / QC | 3 |
| Submit | Submitted | 4 |
| Won | Won | 5 |
| Lost | Lost | 6 (collapsed or hidden) |

The current hardcoded cols use 5 stages ('lead', 'qty', 'price', 'qc', 'sent'). Live version should group 'Takeoff/Pricing' into one column (the current two-column split doesn't map to the schema). Simplification: use the 4 active stages (ITB → Takeoff/Pricing → Review → Submit), then Won/Lost as terminal states.

**Stage advance sequence:**
- ITB → Takeoff/Pricing
- Takeoff/Pricing → Review
- Review → Submit
- Submit → Won | Lost (two terminal options)

---

## 10. CalendarView Data Strategy

The CalendarView shows jobs with `install_start`/`install_end` dates. The `jobs` table has no install date columns in the current schema. The CalendarView in this phase should:

**Option A (simpler):** Load all jobs and use `created_at` as a proxy for now, rendering whatever jobs exist. The calendar is a "best effort" in Phase 3 — real install dates can be added in Phase 5 (Cross-View Workflow).

**Option B (correct):** Add `install_start date` and `install_end date` columns to the jobs table.

**Recommended:** Option B — add the columns. The CalendarView was always meant to show install windows. Add columns via ALTER TABLE.

```sql
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS install_start date;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS install_end date;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS gc_name text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contract_value numeric(12,2);
```

---

## 11. Risk Areas

| Risk | Mitigation |
|------|-----------|
| `line_items.total` is generated column — cannot be in INSERT payload | Always omit `total` from insert/update; read it from SELECT |
| File size limit on views-secondary.jsx (537 lines) | Write in two passes at component boundary |
| `window.Fuse` not available when LibraryView mounts | Add defensive check: `if (typeof window.Fuse !== 'function') { ... }` |
| `activeBidId` is null on first visit before user clicks a pipeline card | EstimatorView shows EmptyState: "Select a bid from the Pipeline to open its estimate" |
| Bid number uniqueness collisions | Use `Date.now()` suffix — acceptable for 4-10 users; retry on conflict |
| `bids.stage` CHECK constraint — inserting wrong value causes 400 error | Always use exact DB enum values: `'ITB'`, `'Takeoff/Pricing'`, `'Review'`, `'Submit'`, `'Won'`, `'Lost'` |
| Category filtering on contacts uses `role` column (gc/owner/sub/field) | Filter tab labels map to DB values: GCs→gc, Owners→owner, Subs→sub, Field→field |

---

## 12. Validation Architecture

### Test surface
No automated test runner available (CDN-only, no npm). Validation is manual + acceptance-criteria based.

### Per-requirement verification approach

| Requirement | Verification method |
|-------------|-------------------|
| DATA-03: No hardcoded arrays | Grep source files for `const.*=.*\[{` — should return zero matches after phase |
| DATA-04: Loading states | Open each view while offline/throttled — spinner must appear |
| DATA-05: Empty states | Truncate each table in Supabase, reload — empty state must appear |
| PIPE-01: Create bid | Fill inline form, submit, reload — bid appears in kanban |
| PIPE-02: Advance stage | Click stage button — card moves to next column |
| PIPE-03: Jobs load from DB | Delete hardcoded rows, add real jobs in Supabase — jobs appear |
| EST-01: Create estimate | Click bid card → EstimatorView shows correct bid name in header |
| EST-02: Add/edit/delete line items | CRUD operations persist across page reload |
| EST-03: Subtotals auto-recalculate | Change qty — subtotal and grand total update without reload |
| EST-04: Library insert | Search library → Insert → line item appears in estimator |
| EST-05: Line items persist | Add item, reload page, navigate back to same bid — item present |
| LIB-01: Library loads | Library table shows data after CSV import via Supabase dashboard |
| LIB-02: Fuzzy search | Type partial description — matching items appear |
| LIB-03: Filter by category | Click category chip — only matching items shown |
| LIB-04: Add/edit items | Save new item — appears in table without page reload |
| LIB-05: No retroactive change | Edit library item price — existing estimate line items unchanged |
| CONT-01: Contacts load | Contacts table shows DB records |
| CONT-02: Add/edit contact | Save — appears in list immediately |
| CONT-03: Filter by role | Click tab — correct subset shown |

---

## 13. Implementation Order (Wave Strategy)

**Wave 1 — Foundation (parallel):**
- 03-01: schema migrations + Spinner/EmptyState components + index.html CDN additions
- 03-02: supabase.js query helper functions

**Wave 2 — Core views (parallel, depends on Wave 1):**
- 03-03: shell.jsx activeBidId threading
- 03-04: views-home.jsx PipelineView live data + create bid form + stage advance
- 03-05: views-estimator.jsx live line items + library insert

**Wave 3 — Secondary views (parallel, depends on Wave 1):**
- 03-06: views-jobs.jsx live jobs + JobView
- 03-07: views-secondary.jsx LibraryView live data + Fuse.js search + add/edit
- 03-08: views-secondary.jsx ContactsView live data + add/edit contact
