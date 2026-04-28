# Research Summary: F&S Estimating Suite

*Synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*

---

## Recommended Stack

| Library | CDN URL | Purpose |
|---------|---------|---------|
| React 18 + ReactDOM | unpkg.com/react@18/umd | UI (already in use) |
| Babel Standalone | unpkg.com/@babel/standalone | JSX transpile (already in use) |
| Supabase JS v2 | cdn.jsdelivr.net/npm/@supabase/supabase-js@2 | Auth + DB + Storage + Realtime |
| Chart.js 4.5.1 | cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js | Reports bar/line charts |
| jsPDF 3.x | cdnjs.cloudflare.com/.../jspdf.umd.min.js | PDF generation |
| html2canvas 1.4.1 | cdn.jsdelivr.net/npm/html2canvas@1.4.1 | DOM-to-image for PDF |
| Fuse.js 7.1.0 | cdn.jsdelivr.net/npm/fuse.js@7.1.0 | Fuzzy search in Pricing Library |

**NOT recommended**: html2pdf.js (buggy wrapper), jsPDF `.html()` method (unstable), @react-pdf/renderer (requires build step), pdf-lib (too manual for layout matching).

---

## Table Stakes Features (must ship in v1)

1. **Bid pipeline** — kanban with stages, due dates, ITB source, win/loss reason
2. **Estimating workbook** — line items with division hierarchy, running totals, alternates
3. **Pricing library** — searchable, editable, snapshot-at-use (no retroactive price changes)
4. **PDF proposal** — branded, consistent, generated from estimate data
5. **Job handoff** — won bid → active job without re-entry
6. **Change orders** — per-job CO log with running contract value
7. **Contact directory** — GCs, owners, subs linked to bids/jobs
8. **Document vault** — per-job file storage (plans, specs, submittals, RFIs)

---

## Key Differentiators Worth Building

- **Assembly bundles** in pricing library (one drag = multiple line items) — casework-specific
- **Bid-hit analytics by GC/project type** — drives real business decisions
- **Capacity/backlog calendar** — answers "can we take this job?"
- **Stale-rate warnings** on pricing library items (>90 days without update)
- **AWI grade field** on proposals + project-type pricing assumptions

---

## Anti-Features to Skip

- Multi-step approval workflows (overkill for 4-10 people)
- Role-based permissions v1 (all users see everything)
- PDF takeoff / quantity surveying (millwork quantities come from shop drawings, not PDF measurement)
- AI auto-estimate (trust the estimator's judgment)
- Real-time collaboration indicators

---

## Data Model Core Entities

```
Contacts → Jobs → Bids → LineItems (→ LibraryItems)
                  Jobs → ChangeOrders
                  Jobs → Documents (Supabase Storage)
                  Jobs → ActivityLog
```

**Key schema notes:**
- Line items snapshot library price at time of entry — no live FK dependency
- Never store computed totals (bid total = sum(line_items)) — always derive
- CO approval must update `jobs.contract_val`
- Bid versioning: `version` integer, never overwrite history

---

## Critical Pitfalls to Avoid

| Pitfall | Prevention |
|---------|-----------|
| Stream timeout writing large JSX | Max 300 lines per write, split into passes |
| Supabase auth token expiry | `onAuthStateChange` handler on init |
| html2canvas not rendering web fonts | Use system fonts in proposal div (Arial, Courier New) |
| RLS silently blocking all queries | Add authenticated policy immediately after enabling RLS |
| Realtime subscription leaks | Return cleanup function from every useEffect subscription |
| Stale computed totals in DB | Never store totals; always derive from line_items |
| PDF multi-page canvas overflow | Capture one page section at a time |

---

## Recommended Build Order

```
Phase 1: Fix broken app (views-secondary.jsx) ← IMMEDIATE BLOCKER
Phase 2: Supabase foundation (schema, RLS, auth, supabase.js)
Phase 3: Wire all views to real data (replace sample arrays)
Phase 4: PDF proposal generation (requires real estimate data)
Phase 5: Cross-view workflow wiring (pipeline → estimator → job → CO)
Phase 6: Document upload to Supabase Storage
Phase 7: Reports & Margin real aggregation queries + analytics
```

Phase 1 is a hard blocker — the app currently produces a 404 on `views-secondary.jsx` and won't render anything.
