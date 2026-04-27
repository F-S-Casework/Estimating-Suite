# F&S Estimating Suite

## What This Is

A browser-based operational tool for a commercial casework/construction company that unifies three previously disconnected tools — the F&S Estimator, Job Dashboard, and Estimating_Master pricing library — into one cohesive pre-construction lifecycle management suite. It serves 4–10 people (estimators and PMs) who manage the full flow from invitation to bid through project handoff, scheduling, and analysis.

## Core Value

An estimator can move from receiving an ITB to generating and sending a professional PDF proposal without leaving the app or re-entering data.

## Requirements

### Validated

- ✓ App shell, navigation, design system — existing
- ✓ Home view (KPIs, pipeline overview, activity feed, capacity calendar) — existing
- ✓ Pipeline kanban board (5 columns: Prospect → Bidding → Submitted → Won → Lost) — existing
- ✓ Estimator workbook (3-pane: division tree / line items / pricing library side panel) — existing
- ✓ Jobs list view with KPIs (contracted value, COs, crew capacity) — existing
- ✓ Job detail view (install calendar, docs, activity) — existing
- ✓ Change order view (CO creation and tracking per job) — existing

### Active

- [ ] Calendar view — install schedule with job bars + crew capacity gauge
- [ ] Pricing Library view — searchable 1,240-item table with category filters
- [ ] Contacts view — GCs, owners, subs, field contacts with filter tabs
- [ ] Docs view — file browser tagged by job (plans, specs, submittals, RFIs)
- [ ] Reports view — hit rate, bid history, backlog charts and tables
- [ ] Margin analysis view — by GC, project type, and estimator
- [ ] Supabase data layer — real persistent data replacing sample data
- [ ] Supabase Auth — email/password login for 4–10 users
- [ ] PDF proposal generation — matching existing F&S Estimator format
- [ ] Cross-view workflow wiring (Pipeline → Estimator → Job handoff → CO)
- [ ] Docs upload to Supabase Storage
- [ ] Reports and Margin driven by real Supabase queries

### Out of Scope

- Mobile app — web-first, desktop-optimized (1440px viewport)
- Real-time collaboration / presence indicators — not needed for team size
- Role-based permissions / access control — all 4–10 users see everything (v1)
- Email sending from app — proposals are downloaded as PDF and sent manually (v1)
- Offline mode — requires active connection to Supabase

## Context

- **Existing codebase**: Shell, styles, home view, estimator view, and jobs view are fully implemented in `/home/claude/repo/project/`. The `views-secondary.jsx` file is the only missing piece blocking the app from loading.
- **Prior tools being replaced**: F&S Estimator (had PDF output), Estimating_Master.xlsx (pricing library), separate Job Dashboard spreadsheet
- **PDF format**: Existing F&S Estimator PDF must be reproduced exactly. User will supply a sample before PDF phase begins.
- **Tech stack decision**: No build step by design — browser-based React 18 + Babel standalone. Supabase JS client works via CDN tag.
- **Design system**: "Architect's Desk" — warm paper palette (`#f6f1e6`), burnt sienna accent (`#b05028`), Inter + JetBrains Mono + Caveat fonts. All CSS vars defined in `project/styles.css`.

## Constraints

- **Tech stack**: React 18 + Babel standalone (no npm, no build step) — must stay CDN-only
- **Supabase**: New project to be created; user needs to set it up and provide API keys
- **PDF sample**: User will share the existing F&S Estimator PDF before Phase 3 begins
- **File size**: Individual JSX files must stay under ~300 lines per write operation to avoid stream idle timeout

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No build step (CDN-only React) | Simplicity, no environment setup for non-devs on the team | — Pending |
| Supabase over Firebase | SQL-friendly, free tier sufficient, CDN-compatible | — Pending |
| PDF via html2canvas + jsPDF | Both CDN-compatible, can render existing HTML layouts | — Pending |
| Single .planning/ in /repo | GSD project root is /repo, all planning docs stay there | — Pending |

---
## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-27 after initialization*
