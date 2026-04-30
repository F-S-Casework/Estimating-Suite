---
phase: 03-live-data-layer
plan: 06
status: Complete
executor: agent-aa88c08e4a6544c0a
date: 2026-04-30
---

## What was built

JobsView and JobView in `project/views-jobs.jsx` updated to use live Supabase data:

- **JobsView**: Replaced hardcoded 6-row array with `window.dbHelpers.getJobs()` on mount. Shows `window.Spinner` while loading (jobs === null), `window.EmptyState` ("No active jobs / Jobs appear here when bids are marked as Won.") when empty, and a live table with columns: job number, name, status chip, contract_value (formatted), install window, gc_name. Row click sets `window.__activeJob = r` and calls `window.__go('job')`.

- **JobView**: Updated from static to live — reads `window.__activeJob`, queries `change_orders` table for the active job, computes approved CO sum (netCOs) and net value (contract_value + netCOs). Install window formatted from install_start/install_end. Shows EmptyState when no job is selected.

- **COView**: Unchanged (static, as planned — live data in Phase 5).

- **React hook aliases**: `const { useState: uS_jobs, useEffect: uE_jobs } = React;` at top of file to avoid collisions with other views files.

## Files modified

- `project/views-jobs.jsx` — JobsView + JobView rewritten with live data; COView preserved; window.Views registration unchanged.

## Self-Check: PASSED

- [x] `window.dbHelpers.getJobs` called in JobsView useEffect
- [x] `uS_jobs` / `uE_jobs` hook aliases used throughout
- [x] `window.Spinner` shown while jobs === null
- [x] `window.EmptyState` shown when jobs.length === 0
- [x] Live columns: number, name, gc_name, status, contract_value rendered
- [x] Row click sets window.__activeJob and navigates to 'job'
- [x] JobView reads window.__activeJob, queries change_orders, shows net value
- [x] COView unchanged
- [x] window.Views registration preserved with all three views: jobs, job, co
