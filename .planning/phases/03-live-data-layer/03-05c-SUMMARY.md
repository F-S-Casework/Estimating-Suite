# Plan 03-05c Summary — ZZTakeoff Import + Exclusions/Clarifications/Terms Panels

**Status:** Complete
**Completed:** 2026-04-30
**Phase:** 03-live-data-layer

## One-liner
Added Exclusions, Clarifications, and Terms JSONB editors plus ZZTakeoff XLSX import to EstimatorView.

## What was built

### Text-list panels
- **Exclusions panel** (`centerView === 'exclusions'`): edits `bid.exclusions` JSONB array; each item `{ text, active, sub }`; checkbox, text, delete, add; persists via `updateBidTerms`
- **Clarifications panel** (`centerView === 'clarifications'`): same structure for `bid.clarifications`
- **Terms panel** (`centerView === 'terms'`): shows all 5 sections (general_terms, warranty, finish_terms, hardware_terms, fab_note) as collapsible groups with same item UI

### ZZTakeoff XLSX import
- "Import ZZTakeoff" button in sidebar triggers `window.showOpenFilePicker`
- Detects Format A (has "Cost Each" column) vs Format B (has "Measurement 1" column)
- Groups rows into areas, creates one default "Casework" section per area
- Preview modal shows area list + item counts before committing
- On confirm: creates areas/sections/line_items via `window.dbHelpers`
- Falls back to "Import requires Chrome/Edge" if File System Access API unavailable

## Files modified
- `project/views-estimator.jsx` — added panel implementations and import button

## Developer action required
- Run Phase 3 schema migrations in Supabase Dashboard (from 03-01) before testing JSONB columns

## Self-Check: PASSED
