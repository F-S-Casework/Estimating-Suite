# Plan 02-01 Summary — Schema & Supabase Config

**Status:** Complete
**Completed:** 2026-04-29
**Phase:** 02-supabase-foundation

## What Was Built

Created the full database schema for the F&S Estimating Suite and initialized the Supabase client.

### Files Created

**`supabase/schema.sql`** — Full DDL for all 8 tables with RLS policies:
- `jobs` — status: Shop/Ready/Installing/Installed/Held
- `bids` — stage: ITB/Takeoff/Pricing/Review/Submit/Won/Lost
- `line_items` — computed `total` column (qty × unit_cost), unit: EA/LF/SF/SY/CY/LS/HR/TON
- `contacts` — role: gc/owner/sub/field
- `library_items` — pricing library entries
- `change_orders` — per-job CO tracking
- `documents` — file references (storage in Phase 6)
- `activity_log` — audit trail with auth.users FK

Each table: `ALTER TABLE x ENABLE ROW LEVEL SECURITY` + `CREATE POLICY "authenticated_full_access" FOR ALL TO authenticated USING (true) WITH CHECK (true)`

**`project/supabase.js`** — CDN client initialization:
- Exposes `window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`
- Plain JS (no `type="text/babel"`) — runs before Babel processes JSX
- TODO markers for developer to fill in project credentials

### Manual Step Completed (by developer)

Schema applied via Supabase Dashboard SQL Editor. All 8 tables visible in Table Editor with RLS policies active.

## Requirements Addressed

- DATA-01: Supabase project configured with full 8-table schema ✓
- DATA-02: RLS policies grant authenticated users full read/write access ✓

## Key Decisions Implemented

- D-08: bids.number is `text UNIQUE NOT NULL` to accommodate Q-YY-NNN format
- D-09: jobs.number is `text UNIQUE NOT NULL` to accommodate YY-NNN format
- D-10: bids.stage CHECK enforces ITB/Takeoff/Pricing/Review/Submit/Won/Lost
- D-11: jobs.status CHECK enforces Shop/Ready/Installing/Installed/Held
- D-12: contacts.role CHECK enforces gc/owner/sub/field (lowercase)

## Commits

- `fced5b6` — feat(02-01): create supabase/schema.sql with 8 tables and RLS policies
- `203e7ee` — feat(02-01): create project/supabase.js — Supabase client init
