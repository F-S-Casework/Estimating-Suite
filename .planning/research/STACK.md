# CDN Stack Research — F&S Estimating Suite
*Researched: 2026-04-27*

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

---

## PDF Generation

### The Core Problem

The F&S Estimating Suite requires "exact reproduction" of the existing F&S Estimator PDF format. This is the hardest CDN constraint because:
- Server-side PDF renderers (Puppeteer, WeasyPrint) are off the table — no Node backend.
- React-based PDF renderers (`@react-pdf/renderer`) require a build step and have no CDN UMD.
- The PDF must match an existing layout, not be designed from scratch.

### Option 1: html2canvas + jsPDF (Recommended)

**How it works:** html2canvas renders a visible DOM element as a `<canvas>` bitmap. jsPDF embeds that canvas as a PNG image in a PDF file. The user triggers download.

**CDN compatibility:** Both libraries ship UMD builds. No dynamic imports, no bundler required. Load order: jsPDF → html2canvas → jsPDF-AutoTable (plugin attaches to `window.jsPDF`).

**Strengths:**
- What-you-see-is-what-you-get: the PDF exactly mirrors the rendered HTML/CSS.
- Existing CSS layout can be reused for the proposal view.
- jsPDF-AutoTable adds structured table support without html2canvas for tabular sections.

**Known limitations:**
- **Bitmap output**: Text in the PDF is not selectable — it's embedded as a rasterized image. Acceptable for a proposal PDF; problematic if the client needs copy-paste text.
- **CSS support gaps**: html2canvas does not support CSS animations, some advanced transforms, or CSS `filter` properties. Shadows render inconsistently. Keep the proposal template's CSS conservative.
- **Cross-origin images**: Any `<img>` tag in the captured area must be same-origin or CORS-enabled. Company logo must be hosted or base64-inlined.
- **Large canvas clipping**: If the proposal is multi-page, the canvas can exceed browser memory limits. Mitigation: capture one page section at a time and add each as a separate jsPDF page.
- **Device inconsistency**: Rendering varies slightly across screen DPIs. Use `scale: 2` option in html2canvas for consistent output.

**Recommended implementation pattern:**
```js
// Capture a hidden proposal-layout div, not the live app
const canvas = await html2canvas(document.getElementById('proposal-print'), {
  scale: 2,
  useCORS: true,
  logging: false
});
const pdf = new jspdf.jsPDF({ unit: 'pt', format: 'letter' });
pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 612, 792);
pdf.save('proposal.pdf');
```

### Option 2: html2canvas-pro (Considered, Not Recommended)

`html2canvas-pro` (`https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.0/dist/html2canvas-pro.min.js`) is a fork with improved CSS support. However, it is a smaller community project with less validation at scale. For a critical client-facing document, the stability of html2canvas 1.4.1 is preferable. Revisit if html2canvas CSS gaps become blockers.

### Option 3: pdf-lib (Not Recommended for This Use Case)

pdf-lib (`https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js`) is excellent for **programmatic** PDF construction — drawing text at coordinates, filling form fields, merging PDFs. Available via CDN UMD (`window.PDFLib`).

**Reason to skip:** Reproducing the exact F&S layout programmatically would require manually positioning every text element, line, and box at exact coordinates. This is a large implementation burden and loses the benefit of "render the existing HTML." Use pdf-lib only if the bitmap-text issue becomes a hard requirement from the client.

### Option 4: jsPDF `.html()` Method (Not Recommended)

jsPDF has a native `.html()` method that attempts vector text output without html2canvas. However, the official jsPDF docs note it dynamically imports html2canvas internally anyway when rendering DOM elements. It also requires DOMPurify for string HTML input. The benefit is marginal over the direct html2canvas approach and adds an unpredictable dependency load.

### Option 5: html2pdf.js (Not Recommended)

`html2pdf.js` is a convenience wrapper around html2canvas + jsPDF. It is available via CDN but has known bugs with its content-cloning step, causes layout reflow during capture, and is less maintained than its dependencies. Use the components directly.

---

## Data Visualization

### Use Cases in This App

1. **Hit rate chart** (Reports view): Proportion won/lost/pending bids — best as a donut or horizontal bar.
2. **Bid history** (Reports view): Bid count or value over time — line or bar by month/quarter.
3. **Backlog chart** (Reports view): Contracted work by month — stacked bar.
4. **Margin analysis** (Margin view): Margin % by GC, project type, estimator — horizontal bar or grouped bar.
5. **Capacity gauge** (Home/Calendar): Crew utilization gauge — a simple arc or progress bar.

### Option 1: Chart.js 4.5.1 (Recommended)

**CDN:** `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js`

Exposes `window.Chart`. UMD build confirmed working without any bundler. No dependencies.

**Strengths:**
- Covers all five use cases above natively: bar, line, doughnut, pie, polar area.
- Responsive by default; works in a flex/grid dashboard layout.
- Good enough aesthetics with minimal configuration; custom colors can be set to match the Architect's Desk palette (`#b05028` burnt sienna, `#f6f1e6` paper).
- 4.x is a mature, stable API with no planned breaking changes in 2026.

**Considerations:**
- Bundle is ~200 KB minified. Loaded once, cached.
- Chart.js renders to `<canvas>`, which is not SVG — not infinitely zoomable, but acceptable at 1440px.
- For the capacity gauge, Chart.js does not have a built-in gauge chart type. Use a doughnut with a single arc as a workaround, or use inline SVG for the gauge only.

**Usage pattern with React + Babel CDN:**
```jsx
// Chart.js + React without useEffect complications:
// Create a <canvas ref={canvasRef}> and instantiate Chart in useEffect
const chartRef = React.useRef(null);
React.useEffect(() => {
  const chart = new Chart(chartRef.current, { type: 'bar', data, options });
  return () => chart.destroy(); // cleanup on unmount
}, [data]);
```

### Option 2: Inline SVG (Recommended for Capacity Gauge Only)

For the crew capacity gauge on the Home view and Calendar view, a hand-drawn SVG arc is simpler, lighter, and more controllable than pulling in Chart.js just for one component. SVG is directly expressible in JSX.

```jsx
// Gauge ring: 0–100% capacity
const r = 40, circ = 2 * Math.PI * r;
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r={r} fill="none" stroke="#e8dfc8" strokeWidth="10"/>
  <circle cx="50" cy="50" r={r} fill="none" stroke="#b05028" strokeWidth="10"
    strokeDasharray={`${(pct/100)*circ} ${circ}`}
    transform="rotate(-90 50 50)"/>
</svg>
```

Use inline SVG for: gauge, simple KPI sparklines, icon-scale indicators.
Use Chart.js for: any chart with axes, legends, labels, or multi-dataset data.

### Option 3: D3.js (Not Recommended)

D3 v7 is available via CDN. It is the most powerful JS visualization library. However:
- D3 at full capability requires a substantial learning investment.
- The bar and line charts needed here are well within Chart.js's scope.
- D3's direct DOM manipulation conflicts unpredictably with React's virtual DOM.
- Bundle is large (~500 KB) for the subset used.

Skip D3 unless a visualization requirement emerges that Chart.js cannot handle.

### Option 4: Recharts, Victory, Nivo (Not Recommended)

All are excellent React chart libraries, but all require npm and a build step. No CDN UMD builds. They are out of scope for this project's CDN-only constraint.

### Option 5: Google Charts (Not Recommended)

Available via CDN with no build step. However: external data dependency (Google's servers), requires `google.charts.load()` async callback pattern that is awkward to wire into React state, and limited customization for matching the Architect's Desk visual system.

---

## Supabase CDN Patterns

### Loading the Client

**UMD (recommended for this app):**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
This exposes `window.supabase`. Instantiate the client globally:
```js
const { createClient } = supabase;
const db = createClient('https://<project>.supabase.co', '<anon-key>');
window._supabase = db; // make available across jsx files
```

**ESM alternative** (works in `<script type="module">` but conflicts with Babel standalone's `type="text/babel"`):
```js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
```
Avoid mixing ESM imports and Babel standalone — Babel processes `type="text/babel"` tags and does not intercept `import` statements in ESM modules. Stick with the UMD approach since the rest of the app uses Babel standalone.

### Auth Pattern (Browser / localStorage)

Supabase JS v2 defaults to `persistSession: true` with `localStorage`. For a 4–10 user internal tool this is appropriate — no SSR, no cookie-based auth needed.

```js
// Sign in
const { data, error } = await db.auth.signInWithPassword({
  email, password
});

// Check session on load
const { data: { session } } = await db.auth.getSession();

// Listen for auth changes (use in top-level shell component)
db.auth.onAuthStateChange((event, session) => {
  // event: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
  setUser(session?.user ?? null);
});
```

Token refresh is automatic (`autoRefreshToken: true` by default). Sessions persist through browser restarts.

### Realtime Pattern

Realtime is available via the same client. For this app, realtime is out of scope (per PROJECT.md), but if needed for activity feeds:

```js
const channel = db.channel('pipeline-changes')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'bids'
  }, payload => console.log(payload))
  .subscribe();

// Cleanup:
db.removeChannel(channel);
```

### Storage Pattern (Docs Upload)

```js
// Upload a file
const { data, error } = await db.storage
  .from('project-docs')
  .upload(`${jobId}/${file.name}`, file);

// Get a signed URL for download
const { data: { signedUrl } } = await db.storage
  .from('project-docs')
  .createSignedUrl(`${jobId}/${file.name}`, 3600); // 1 hour expiry
```

Files are auto-distributed via Cloudflare CDN by Supabase. RLS policies on the bucket control access. For this app's single-permission-level model, a bucket policy allowing all authenticated users is sufficient.

### Query Pattern (Row-Level Queries)

```js
// Fetch bids with related job data
const { data, error } = await db
  .from('bids')
  .select('*, job:jobs(name, gc)')
  .eq('status', 'submitted')
  .order('created_at', { ascending: false });
```

The `.select()` string supports PostgREST foreign key expansion. No ORM needed.

### Version Note

Current stable: `@supabase/supabase-js@2.103.3` (as of 2026-04-27). The `@2` CDN tag resolves to the latest v2 minor. Safe to use `@2` rather than pinning a patch version, as Supabase maintains backward compatibility within v2.

---

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

---

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

The jsPDF 3.x + jsPDF-AutoTable version matrix is the highest implementation risk. jsPDF 3.0.3 is on cdnjs; jsPDF-AutoTable's latest confirmed cdnjs version is 3.5.25 (designed for jsPDF 2.x). Before implementing PDF generation, verify AutoTable v4+ CDN availability or test the 3.5.25 version against jsPDF 3.x. If incompatible, pin jsPDF to `2.5.1` and use AutoTable `3.5.25` — both have confirmed cdnjs entries and are mutually compatible.

Pinned safe combination:
- `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
- `https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js`
