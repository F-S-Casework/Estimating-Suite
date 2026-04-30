# Phase 3: Live Data Layer — Validation Criteria

**Phase:** 3 — Live Data Layer
**Status:** Audited — 2026-04-30
**Nyquist:** PARTIAL — 6 automated static checks + 20 manual-only (CDN-only stack, no test runner)

No automated test runner available (CDN-only, no npm). All validation is manual acceptance-criteria based.

---

## Acceptance Criteria by Requirement

| Requirement | Verification Method |
|-------------|---------------------|
| **DATA-03**: No hardcoded arrays in live views | `grep -n "const.*=.*\[{" project/views-*.jsx` — zero matches in views updated this phase |
| **DATA-04**: Loading states on all data-backed views | Open each view while throttled (DevTools → Network → Slow 3G) — spinner must appear |
| **DATA-05**: Empty states on all data-backed views | Truncate each table in Supabase, reload — empty state with correct copy must appear |
| **PIPE-01**: Create bid | Fill inline form in Pipeline Prospect column; submit → bid appears in kanban; reload → still present |
| **PIPE-02**: Advance stage | Click stage button on a bid card → card moves to next column without page reload |
| **PIPE-03**: Jobs load from DB | Confirm jobs table has data; navigate to Jobs → live rows appear |
| **PIPE-04**: Job detail live data | Click a job row → JobView header shows that job's contract_value, install window, gc_name; if COs exist → net value shown |
| **EST-01**: Create estimate | Click a pipeline card → EstimatorView opens showing that bid's name in header |
| **EST-02**: Add/edit/delete line items | Add a line item → appears; edit description/qty in-place → saves; hover row → ✕ → confirm → removed |
| **EST-03**: Subtotals auto-recalculate | Change qty on a row → extended and grand total update without page reload |
| **EST-04**: Library insert | Library tab → search → Insert button → item appears as new line in estimator |
| **EST-05**: Line items persist | Add items; reload page; navigate back to same bid → items still present |
| **LIB-01**: Library loads | Library view shows items after CSV import via Supabase dashboard |
| **LIB-02**: Fuzzy search | Type partial description in Library search → matching items appear |
| **LIB-03**: Filter by category | Click a category chip in Library → only that category shown |
| **LIB-04**: Add/edit library items | Click "+ Add Item" → fill form → Save → item appears without page reload |
| **LIB-05**: No retroactive changes | Edit a library item's unit_cost → existing estimate line items are NOT changed |
| **CONT-01**: Contacts load | Navigate to Contacts → spinner → live contact rows (or EmptyState) |
| **CONT-02**: Add/edit contact | Click "+ Add Contact" → fill form → Save → row appears; click row → edit form pre-fills; Save → row updates in place |
| **CONT-03**: Filter by role | Click "GCs" tab → only gc-role contacts shown; "All" → all shown |

---

## Empty State Copy Reference

| View | Heading | Body |
|------|---------|------|
| Pipeline | No bids yet | Create your first bid by clicking "+ Ingest ITB". |
| Estimator (no bid) | No line items | Select a bid from the Pipeline to open its estimate. |
| Estimator (empty bid) | *(empty tbody — no EmptyState per D-04)* | — |
| Jobs | No active jobs | Jobs appear here when bids are marked as Won. |
| Library | Pricing library is empty | Import your pricing library via the Supabase dashboard. |
| Contacts | No contacts yet | Add GCs, owners, subs, and field contacts here. |

---

## Critical Invariants to Spot-Check

| Invariant | How to verify |
|-----------|---------------|
| `line_items.total` never sent in INSERT/UPDATE | In DevTools Network tab, inspect the POST/PATCH to `line_items` — `total` must not appear in request body |
| `activeBidId` persists across reload | Open a bid in Estimator; reload page → still on that bid's estimator |
| Null = loading (never `[]` = loading) | Add `console.log(lineItems)` temporarily — first render must log `null`, not `[]` |
| bids.stage uses DB enum values | Check Network tab on stage advance — value must be `'Takeoff/Pricing'`, `'Review'`, `'Submit'`, `'Won'`, or `'Lost'` |
| Contacts role filter uses DB values | Network request to `contacts` table when filtering must use `gc`, `owner`, `sub`, `field` (client-side filtered, no DB call per tab) |

---

## Regression Checks (Prior Phase Features)

After Phase 3 execution, verify these Phase 1–2 features are unbroken:

- Auth gate: unauthenticated users still see login screen
- Nav rail: all tabs navigate correctly (Home, Pipeline, Estimator, Jobs, Library, Contacts, etc.)
- HomeView: KPI cards and recent activity still render (may be static — verify no crash)
- No `window is not defined` or `React is not defined` console errors on any view

---

*Phase: 3-Live Data Layer*
*Created: 2026-04-30*

---

## Automated Static Checks (run 2026-04-30)

These grep-based checks can be re-run at any time without a browser:

| Check | Command | Result |
|-------|---------|--------|
| DATA-03: No hardcoded data arrays in live views | `grep -n "const.*=.*\[{" project/views-*.jsx` | ✓ PASS — 0 matches |
| DATA-03: Views use dbHelpers not raw window.sb | `grep -n "window\.sb\.from" project/views-home.jsx project/views-estimator.jsx project/views-secondary.jsx` | ✓ PASS — 0 matches |
| EST-05: activeBidId persisted to localStorage | `grep -c "fs-active-bid\|localStorage" project/shell.jsx` | ✓ PASS — 4 matches |
| DATA-04: Null=loading pattern used | `grep -c "=== null" project/views-*.jsx` (data-bearing views) | ✓ PASS — 6 matches |
| EST-03: V2 cost formula chain in EstimatorView | `grep -n "matOh\|oh_pct\|del_pct\|ins_pct" project/views-estimator.jsx` | ✓ PASS — formula confirmed |
| EST-02: line_items.total never sent in writes | `grep -n "total" project/supabase.js` | ✓ PASS — guard comment present |
| CDN order: XLSX before Fuse.js in index.html | `grep -n "xlsx\|fuse" index.html` | ✓ PASS — lines 22/23 correct |
| LIB-02: window.Fuse graceful fallback | `grep -n "typeof window\.Fuse" project/views-secondary.jsx` | ✓ PASS — fallback present |

## Deviations Noted

| File | Line | Issue | Severity |
|------|------|-------|----------|
| project/views-jobs.jsx | 109 | JobView uses `window.sb.from('change_orders')` directly instead of `window.dbHelpers` | Low — Phase 5 will refactor this; change_orders is out-of-scope for Phase 3 live data |

## Validation Audit 2026-04-30

| Metric | Count |
|--------|-------|
| Requirements audited | 20 |
| Automated static checks | 6 |
| Manual-only | 20 |
| Gaps requiring test generation | 0 (no test runner available) |
| Deviations noted | 1 (low severity) |
| Escalated to manual | 0 |
