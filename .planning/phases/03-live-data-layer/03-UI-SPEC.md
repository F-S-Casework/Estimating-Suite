---
phase: 3
slug: live-data-layer
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-29
---

# Phase 3 — UI Design Contract

> Visual and interaction contract for Phase 3: Live Data Layer.
> All decisions below are locked for the planner and executor — do not deviate without updating this file.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — CDN-only React 18 + Babel standalone |
| Preset | not applicable |
| Component library | none — custom CSS in project/styles.css |
| Icon library | window.Icon (custom inline SVG set in shell.jsx) |
| Font | Inter (body/UI), JetBrains Mono (numbers/code), Caveat (hand annotations) |

**Cardinal rule:** Reuse existing CSS classes. Do NOT invent new class names for anything the existing system already covers. New elements (Spinner, EmptyState, create-bid form) must use existing tokens and follow existing patterns.

---

## Spacing Scale

Tokens derived from existing codebase patterns (padding/gap values observed in JSX):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, tight inline padding |
| sm | 8px | Chip padding, compact row spacing |
| md | 16px | Default card/section padding |
| lg | 24px | Page-section padding (`.page-head` uses 20–24px) |
| xl | 32px | Layout column gaps |
| 2xl | 48px | Major section breaks |

Exceptions: Table rows use 8px vertical padding. `.page-head` uses `padding: 16px 24px`. KPI grid uses `gap: 16px`.

---

## Typography

| Role | Size | Weight | Font | Usage |
|------|------|--------|------|-------|
| Body | 13px | 400 | Inter | Table cells, form inputs, paragraph text |
| Label | 11–11.5px | 600–700 | Inter | Chip text, column headers, category tags |
| Sub-heading | 13–14px | 600 | Inter | Card headings, section labels (`.card-head h3`) |
| Page title | 18–20px | 700 | Inter | `.page-title` |
| KPI value | 24px | 700 | Inter | `.val.tnum` — numbers always tabular (`font-variant-numeric: tabular-nums`) |
| Monospace | 11–12px | 400 | JetBrains Mono | Item codes, IDs (`.mono` or `fontFamily:'var(--mono)'`) |

---

## Color

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Canvas (60%) | `--bg` | #FBF8F2 | App background, view backgrounds |
| Surface (30%) | `--panel` | #FFFFFF | Cards, tables, forms, modals |
| Rail/Chrome | `--panel-alt` | #F3EEE4 | Sidebar, table headers, dividers |
| Primary text | `--ink` | #22201B | All body copy |
| Secondary text | `--ink-3` | #746B60 | Labels, metadata, placeholder text |
| Muted text | `--mute` | #9A9084 | Disabled, hints, column headers |
| Accent (10%) | `--accent` | #C46A3C | Primary buttons, active states, money emphasis |
| Heavy accent | `--accent-2` | #7A4633 | Grand totals, heavy emphasis only |
| Accent wash | `--accent-soft` | #F5E2D3 | Hover state on accent-bordered elements |
| OK/Won | `--ok` | #61775A | Won bids, positive status, success |
| Warning | `--warn` | #D39A4A | Shop status, near-deadline |
| Danger | `--bad` | #9A3A2A | Errors, rejected, destructive actions |
| Border | `--line` | #DDD2C2 | All dividers, input borders |

**Accent reserved for:** Primary CTA buttons (`.btn.accent`), active nav Rail items, money/total emphasis in KPI cards. Never use on plain text links or decorative borders.

---

## Copywriting Contract

### Global Loading & Empty States

| Element | Copy |
|---------|------|
| Spinner aria-label | "Loading…" |
| Pipeline empty heading | "No bids yet" |
| Pipeline empty body | "Create your first bid to start tracking the pipeline." |
| Pipeline empty CTA | "New Bid" |
| Estimator empty heading | "No line items" |
| Estimator empty body | "This estimate is empty. Add line items to build the scope." |
| Estimator empty CTA | "Add Line Item" |
| Jobs empty heading | "No active jobs" |
| Jobs empty body | "Jobs appear here when bids are marked as Won." |
| Library empty heading | "Pricing library is empty" |
| Library empty body | "Import items via the Supabase dashboard, or add items manually." |
| Library empty CTA | "Add Item" |
| Contacts empty heading | "No contacts yet" |
| Contacts empty body | "Add GCs, owners, subs, and field contacts here." |
| Contacts empty CTA | "Add Contact" |
| Error state | "Something went wrong — check your connection and try again." |

### Create / Edit Forms

| Element | Copy |
|---------|------|
| Create bid CTA (inline form) | "New Bid" / "Ingest ITB" (existing button label in shell.jsx) |
| Create bid save button | "Create Bid" |
| Create bid cancel | "Cancel" |
| Stage advance button label | "→ [Next Stage Name]" (e.g., "→ Bidding") |
| Add line item | "+ Add Line Item" |
| Insert library item | "Insert" |
| Add contact | "+ Add Contact" |
| Add library item | "+ Add Item" |
| Save edit | "Save" |
| Destructive delete | "Delete [item]" — confirm with: "Delete this line item? This cannot be undone." |

---

## Component Contracts

### Spinner

```
window.Spinner — reusable loading indicator
```

- CSS-only animated ring (no external library)
- `width: 32px; height: 32px` — border spinner, 3px border
- Color: `var(--accent)` for the active arc, `var(--line)` for the track
- Centered in its container via `display:flex; justify-content:center; align-items:center; padding:48px 0`
- Expose as `window.Spinner = Spinner` at end of shell.jsx

```jsx
// Minimum viable contract:
function Spinner() {
  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', padding:'48px 0'}}>
      <div className="spinner"/>
    </div>
  );
}
```

CSS in styles.css:
```css
.spinner {
  width:32px; height:32px; border-radius:50%;
  border:3px solid var(--line);
  border-top-color:var(--accent);
  animation:spin .7s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }
```

### EmptyState

```
window.EmptyState — reusable empty content indicator
```

- Props: `heading` (string), `body` (string), `action` (optional: `{ label, onClick }`)
- Layout: centered column, max-width 360px, padding 48px 0
- Heading: 14px 600 `--ink-2`
- Body: 13px 400 `--ink-3`, margin-top 6px
- CTA button (if action provided): `.btn.accent.sm`, margin-top 16px
- Expose as `window.EmptyState = EmptyState`

### Inline Create-Bid Form

- Appears as a card at the **top of the Prospect column** when the user clicks "Ingest ITB" or a `+` button
- Styling: `.card` with `padding:12px 16px`; `border:1.5px solid var(--accent-line)` to distinguish from bid cards
- Fields stacked vertically, each with a small label above (`font-size:10.5px; font-weight:700; color:var(--mute); text-transform:uppercase; letter-spacing:.04em`):
  - Client/GC — `<input type="text" placeholder="Turner Construction">`
  - Project Name — `<input type="text" placeholder="Caldwell Medical Center">`
  - Bid Due Date — `<input type="date">`
  - Project Type — `<input type="text" placeholder="Healthcare TI">` (free text in v1)
- Action row: `<button class="btn accent sm">Create Bid</button>` + `<button class="btn ghost sm">Cancel</button>`
- Input styling: existing styles.css input pattern — `border:1px solid var(--line); border-radius:var(--r-sm); padding:5px 8px; font-size:12.5px; width:100%; background:var(--panel)`

### Stage Advancement

- Each pipeline kanban card shows a small stage button at the bottom right
- Button label: next stage name with a `→` prefix (e.g., `→ Bidding`)
- Styling: `.btn.ghost.sm` with `font-size:11px`
- For the final stage (Won/Lost): show two buttons — `Mark Won` (`.chip.ok` style) and `Mark Lost` (`.chip.bad` style)
- Button triggers `window.sb.from('bids').update({stage}).eq('id', bid.id)` then refreshes local state

### Estimator Bid Header

- When an active bid is loaded, show a slim header bar above the line-items table:
  - Bid name (bold, 13px) + `·` + GC name (muted) + `·` + Bid Due: [date]
  - Right-aligned: current grand total (`.tnum`, `--accent-2` color)
- Background: `var(--panel-alt)`, `border-bottom:1px solid var(--line)`, `padding:8px 16px`

### Line Item Edit (Estimator)

- Inline editing: clicking a table cell opens an `<input>` in place (no separate modal)
- On blur or Enter: save to Supabase via `upsert`
- New row added via `+ Add Line Item` button below the last section
- Row delete: appears on row hover as a `×` icon button (`color:var(--bad)`, `opacity:0` → `opacity:1` on hover)

### Library Search Panel (Estimator side panel)

- Existing panel structure reused
- Search input → Fuse.js fuzzy search against loaded `library_items`
- Results list: `code` (mono, 11px), `desc` (13px), `total` price (right-aligned, `--accent`)
- "Insert" button on each result row: `.btn.sm` — copies snapshot to line_items

### Add/Edit Library Item Form

- Appears as an inline row at the top of the library table when user clicks `+ Add Item`
- OR: a small modal card centered on screen for editing an existing item
- Fields: Code, Description, Category (select from existing categories), UOM, Material rate, Labor rate
- Save: `.btn.accent.sm` / Cancel: `.btn.ghost.sm`

### Add/Edit Contact Form

- Inline at top of contacts table when `+ Add Contact` is clicked
- Fields: Name, Company, Role (select: GC/Owner/Sub/Field), Phone, Email
- Save: `.btn.accent.sm` / Cancel: `.btn.ghost.sm`

---

## Interaction Patterns

| Interaction | Behavior |
|-------------|----------|
| Pipeline card click | Sets `activeBidId` in shell state + localStorage, navigates to Estimator |
| Kanban stage advance | Updates `bids.stage` in Supabase, re-renders card in new column |
| Line item cell edit | Click → inline input; blur/Enter → Supabase upsert |
| Line item delete | Hover → `×` button appears; click → confirm dialog → delete from Supabase |
| Library item insert | Click "Insert" → snapshot copied to `line_items` as new row; estimator table re-renders |
| Library search | Keystroke → Fuse.js filters client-side (already-loaded items); no Supabase call per keystroke |
| Contact filter tabs | Click tab → re-query Supabase with `role=eq.{role}` filter OR filter client-side if data already loaded |

---

## Error Handling

| Error scenario | UI treatment |
|----------------|-------------|
| Supabase query fails | Replace spinner/content with centered error message (`--bad` color icon + text + "Try again" button that re-fetches) |
| Save/upsert fails | Inline red border on the edited cell/input + toast-style message below the field: `color:var(--bad); font-size:11.5px` |
| Form validation (empty required field) | Red border (`border-color:var(--bad)`) + helper text below field |

---

## Registry Safety

| Registry | Used | Safety Gate |
|----------|------|-------------|
| Fuse.js 7.1.0 CDN | Yes — library fuzzy search | CDN UMD confirmed; no safety gate required |
| Supabase JS v2 CDN | Already loaded | No change |
| No new libraries added | — | All new UI built from existing CSS + React |

No new CDN dependencies are introduced in this phase beyond Fuse.js (already listed in ROADMAP.md and CLAUDE.md).

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — specific copy for every empty state, CTA, and error
- [x] Dimension 2 Visuals: PASS — all new components use existing .card/.chip/.btn/.wf classes
- [x] Dimension 3 Color: PASS — accent reserved for CTAs/active states only; --bad for errors; --ok for won
- [x] Dimension 4 Typography: PASS — sizes/weights consistent with existing scale; tabular nums on all money
- [x] Dimension 5 Spacing: PASS — all padding/gap values use existing 4px-base scale
- [x] Dimension 6 Registry Safety: PASS — no new CDN deps; Fuse.js is pre-approved

**Approval:** approved 2026-04-29
