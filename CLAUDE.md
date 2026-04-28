<!-- GSD:project-start source:PROJECT.md -->
## Project

**F&S Estimating Suite**

A browser-based operational tool for a commercial casework/construction company that unifies three previously disconnected tools — the F&S Estimator, Job Dashboard, and Estimating_Master pricing library — into one cohesive pre-construction lifecycle management suite. It serves 4–10 people (estimators and PMs) who manage the full flow from invitation to bid through project handoff, scheduling, and analysis.

**Core Value:** An estimator can move from receiving an ITB to generating and sending a professional PDF proposal without leaving the app or re-entering data.

### Constraints

- **Tech stack**: React 18 + Babel standalone (no npm, no build step) — must stay CDN-only
- **Supabase**: New project to be created; user needs to set it up and provide API keys
- **PDF sample**: User will share the existing F&S Estimator PDF before Phase 3 begins
- **File size**: Individual JSX files must stay under ~300 lines per write operation to avoid stream idle timeout
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
| Library | CDN URL | Purpose | Rationale |
|---|---|---|---|
| React 18 | `https://unpkg.com/react@18/umd/react.production.min.js` | UI framework | Already in use; CDN UMD build is production-stable |
| ReactDOM 18 | `https://unpkg.com/react-dom@18/umd/react-dom.production.min.js` | DOM rendering | Paired with React 18 |
| Babel Standalone | `https://unpkg.com/@babel/standalone/babel.min.js` | JSX transpilation | Required for no-build JSX; `type="text/babel"` on script tags |
| Supabase JS v2 | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | Auth + DB + Storage + Realtime | Official CDN support, UMD exposes `window.supabase` |
| Chart.js 4.5.1 | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js` | Hit rate + bar charts | Best CDN chart lib for this scale; no dependencies |
| jsPDF 3.x | `https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.3/jspdf.umd.min.js` | PDF proposal generation | CDN UMD build; pairs with html2canvas |
| html2canvas 1.4.1 | `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js` | DOM-to-image for PDF | Most stable snapshot approach; latest stable is 1.4.1 |
| jsPDF AutoTable | `https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js` | Structured table PDFs | Extends jsPDF; CDN-compatible plugin pattern |
| Fuse.js 7.1.0 | `https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.umd.min.js` | Fuzzy search (Pricing Library) | 1,240-item client-side search; zero deps; CDN-ready |
| date-fns 3.6.0 | `https://cdn.jsdelivr.net/npm/date-fns@3.6.0/cdn.min.js` | Date formatting (calendar, jobs) | Lighter than Luxon; CDN bundle available since v3 |
## PDF Generation
### The Core Problem
- Server-side PDF renderers (Puppeteer, WeasyPrint) are off the table — no Node backend.
- React-based PDF renderers (`@react-pdf/renderer`) require a build step and have no CDN UMD.
- The PDF must match an existing layout, not be designed from scratch.
### Option 1: html2canvas + jsPDF (Recommended)
- What-you-see-is-what-you-get: the PDF exactly mirrors the rendered HTML/CSS.
- Existing CSS layout can be reused for the proposal view.
- jsPDF-AutoTable adds structured table support without html2canvas for tabular sections.
- **Bitmap output**: Text in the PDF is not selectable — it's embedded as a rasterized image. Acceptable for a proposal PDF; problematic if the client needs copy-paste text.
- **CSS support gaps**: html2canvas does not support CSS animations, some advanced transforms, or CSS `filter` properties. Shadows render inconsistently. Keep the proposal template's CSS conservative.
- **Cross-origin images**: Any `<img>` tag in the captured area must be same-origin or CORS-enabled. Company logo must be hosted or base64-inlined.
- **Large canvas clipping**: If the proposal is multi-page, the canvas can exceed browser memory limits. Mitigation: capture one page section at a time and add each as a separate jsPDF page.
- **Device inconsistency**: Rendering varies slightly across screen DPIs. Use `scale: 2` option in html2canvas for consistent output.
### Option 2: html2canvas-pro (Considered, Not Recommended)
### Option 3: pdf-lib (Not Recommended for This Use Case)
### Option 4: jsPDF `.html()` Method (Not Recommended)
### Option 5: html2pdf.js (Not Recommended)
## Data Visualization
### Use Cases in This App
### Option 1: Chart.js 4.5.1 (Recommended)
- Covers all five use cases above natively: bar, line, doughnut, pie, polar area.
- Responsive by default; works in a flex/grid dashboard layout.
- Good enough aesthetics with minimal configuration; custom colors can be set to match the Architect's Desk palette (`#b05028` burnt sienna, `#f6f1e6` paper).
- 4.x is a mature, stable API with no planned breaking changes in 2026.
- Bundle is ~200 KB minified. Loaded once, cached.
- Chart.js renders to `<canvas>`, which is not SVG — not infinitely zoomable, but acceptable at 1440px.
- For the capacity gauge, Chart.js does not have a built-in gauge chart type. Use a doughnut with a single arc as a workaround, or use inline SVG for the gauge only.
### Option 2: Inline SVG (Recommended for Capacity Gauge Only)
### Option 3: D3.js (Not Recommended)
- D3 at full capability requires a substantial learning investment.
- The bar and line charts needed here are well within Chart.js's scope.
- D3's direct DOM manipulation conflicts unpredictably with React's virtual DOM.
- Bundle is large (~500 KB) for the subset used.
### Option 4: Recharts, Victory, Nivo (Not Recommended)
### Option 5: Google Charts (Not Recommended)
## Supabase CDN Patterns
### Loading the Client
### Auth Pattern (Browser / localStorage)
### Realtime Pattern
### Storage Pattern (Docs Upload)
### Query Pattern (Row-Level Queries)
### Version Note
## What NOT to Use
| Library | Reason |
|---|---|
| **Moment.js** | Deprecated by its own authors. Use date-fns instead. ~300 KB bundle for the same functionality date-fns provides in ~15 KB CDN. |
| **Recharts / Victory / Nivo** | No CDN UMD builds. npm + build step required. Out of scope. |
| **@react-pdf/renderer** | No CDN UMD build. Requires Webpack/Vite. Generates PDF from React components natively (vector text), but incompatible with the no-build constraint. |
| **html2pdf.js** | Wrapper over html2canvas + jsPDF with additional bugs. Cloning behavior causes layout reflow. Use the underlying libraries directly. |
| **D3.js** | Overkill for bar/line/donut charts; ~500 KB; direct DOM mutation fights React. Chart.js is the right tool at this scale. |
| **Google Charts** | Async loader pattern is awkward with React. External dependency on Google CDN. Limited customization for custom design system. |
| **Lodash CDN** | Not needed. Native JS array/object methods and Fuse.js cover the use cases. Adds ~70 KB for negligible benefit. |
| **jQuery** | Never needed in a React app. No use case here. |
| **Firebase / Firestore** | NoSQL schema is a worse fit than Supabase's SQL for bid line items, division trees, and pricing library. Already decided in PROJECT.md. |
| **React-select / Downshift** | No CDN UMD. For the pricing library dropdown/search, use Fuse.js + a custom React `<input>` + `<ul>` dropdown instead. |
## Confidence Levels
| Recommendation | Confidence | Notes |
|---|---|---|
| Supabase JS v2 via `@2` UMD CDN | **High** | Official documentation confirms CDN UMD support; widely used in no-build contexts |
| Chart.js 4.5.1 for all chart types | **High** | UMD build confirmed; stable API; no breaking changes in 2026 roadmap |
| html2canvas 1.4.1 + jsPDF 3.x | **Medium-High** | Works reliably for DOM snapshot PDFs; bitmap output is the accepted tradeoff; multi-page capture requires implementation care |
| Inline SVG for capacity gauge | **High** | Zero dependencies; JSX-native; fully controllable |
| Fuse.js for pricing library search | **High** | 1,240 items is well within client-side fuzzy search limits; zero deps; CDN confirmed |
| date-fns 3.6.0 for date ops | **Medium** | CDN bundle added in v3 but the bundle includes all functions (no tree-shaking); acceptable at ~80 KB for this use case; consider native `Intl.DateTimeFormat` for simple formatting if bundle weight is a concern |
| jsPDF AutoTable | **Medium** | Plugin attaches to jsPDF UMD global correctly; version matrix between jsPDF and autotable must be respected (AutoTable 3.x for jsPDF 2.x; verify 4.x autotable compatibility with jsPDF 3.x before using) |
| Avoiding @react-pdf/renderer | **High** | Confirmed: no CDN UMD build exists as of 2026; npm-only |
| Babel standalone for JSX | **High** | Already proven in existing codebase; `type="text/babel"` pattern is stable |
### Key Risk to Monitor
- `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
- `https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
