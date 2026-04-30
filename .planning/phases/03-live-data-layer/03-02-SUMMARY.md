---
plan: 03-02
status: Complete
date: 2026-04-30
---

# 03-02 Execution Summary — Supabase Query Helpers

## Status: Complete

## Files Modified
- `project/supabase.js` — 240 lines (was 7 lines)

## Helpers Added to window.dbHelpers

### Bid helpers (7 + 1 constant)
- `getBids()` — fetch all bids ordered by created_at desc
- `getBid(bidId)` — fetch single bid by id
- `addBid({ gc_name, name, due_date, project_type })` — insert new bid with auto-generated number
- `updateBidStage(bidId, stage)` — update stage (enforces CHECK enum at DB level)
- `updateBid(bidId, fields)` — general-purpose bid column update
- `updateBidInfo(bidId, fields)` — V2 alias for estimator metadata columns
- `updateBidTerms(bidId, columnName, jsonbArray)` — targeted JSONB update for exclusions/clarifications/terms
- `STAGE_NEXT` — constant map: ITB→Takeoff/Pricing→Review→Submit→null

### Area helpers (4)
- `getAreas(bidId)` — fetch areas for a bid
- `addArea(bidId, { name, qty, sort_order })` — insert new area
- `updateArea(areaId, fields)` — update area columns
- `deleteArea(areaId)` — delete area (cascades to sections + line_items)

### Section helpers (5)
- `getSections(areaId)` — fetch sections for one area
- `getAllSections(areaIds)` — fetch sections for multiple areas in one query
- `addSection(areaId, { name, sort_order })` — insert new section
- `updateSection(sectionId, fields)` — update section columns
- `deleteSection(sectionId)` — delete section (cascades to line_items)

### Line item helpers (4)
- `getLineItems(bidId)` — fetch all line items for a bid
- `addLineItem({ bid_id, area_id, section_id, section, description, qty, unit, unit_cost, sort_order, drawing_ref, ignore, no_print })` — insert line item; never includes `total` (generated column)
- `updateLineItem(id, fields)` — update line item; strips `total` defensively
- `deleteLineItem(id)` — delete line item

### Library helpers (2)
- `getLibraryItems(filters)` — fetch library items with optional category filter
- `upsertLibraryItem(fields)` — insert or update library item

### Job helpers (2)
- `getJobs()` — fetch all jobs
- `getJob(id)` — fetch single job

### Contact helpers (3)
- `getContacts(role)` — fetch contacts with optional role filter (gc/owner/sub/field)
- `addContact({ name, company, role, phone, email, notes })` — insert contact
- `updateContact(id, fields)` — update contact columns

### Alternate helpers (4)
- `getAlternates(bidId)` — fetch bid alternates
- `addAlternate(bidId, { description, qty, unit, price, sort_order })` — insert alternate
- `updateAlternate(id, fields)` — update alternate
- `deleteAlternate(id)` — delete alternate

## Total helpers: 31 async functions + 1 constant (STAGE_NEXT)

## Key Invariants Maintained
- `line_items.total` never appears in any INSERT or UPDATE payload
- `updateLineItem` strips `total` defensively via destructuring before sending to Supabase
- All bid stage values use exact CHECK-constraint strings from schema
- `getContacts(role)` accepts exact DB enum values: 'gc', 'owner', 'sub', 'field'
- `getAllSections([])` returns `{ data: [], error: null }` without hitting the DB

## Self-Check: PASSED
- `grep "window.dbHelpers" project/supabase.js` → found (export block)
- `grep "getBids" project/supabase.js` → found
- `grep "getAreas" project/supabase.js` → found
- `grep "getLineItems" project/supabase.js` → found
- `grep "updateBidTerms" project/supabase.js` → found
- `wc -l project/supabase.js` → 240 lines (under 300-line limit)
- `grep -c "async function" project/supabase.js` → 31
