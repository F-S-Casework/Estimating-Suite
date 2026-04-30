---
plan: 03-03
phase: 03-live-data-layer
status: Complete
date: 2026-04-30
---

# 03-03 Execution Summary

## Status: Complete

## What Was Changed in shell.jsx

### New State (AuthenticatedApp)
- `activeBidId` — initialized from `localStorage.getItem('fs-active-bid')`, null if absent
- `activeBidName` — empty string default; set when a bid is opened

### New Function (AuthenticatedApp)
- `openBid(bidId, bidName)` — sets `activeBidId` + `activeBidName`, persists `bidId` to `localStorage` under key `'fs-active-bid'`, calls `go('estimator')` to navigate

### Prop Threading
- `PipelineView` now receives `onOpenBid={openBid}` so it can trigger navigation
- `EstimatorView` now receives `activeBidId={activeBidId}` so it can load the correct bid

### View Render Switch
- Replaced generic `{View ? <View go={go} /> : ...}` with an IIFE switch that routes `pipeline` and `estimator` to their specific prop signatures; all other views use the fallback default branch

### Topbar Crumb
- Estimator case changed from hardcoded `Denver Regional Lab / v3 draft` to `{activeBidName || 'Bid Workbook'}`
- `activeBidName` added to crumb useMemo dependency array

## Files Modified
- `project/shell.jsx` (224 → 249 lines; +31 insertions, -5 deletions; under 300-line limit)

## Self-Check: PASSED

- [x] AuthenticatedApp has activeBidId state with localStorage persistence
- [x] openBid(bidId, bidName) sets state, persists to localStorage, navigates to estimator
- [x] PipelineView receives onOpenBid prop
- [x] EstimatorView receives activeBidId prop
- [x] Estimator crumb shows dynamic activeBidName (not hardcoded)
- [x] No other views or behaviors broken
- [x] File remains under 300 lines (249)
