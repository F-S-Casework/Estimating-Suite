# Pitfalls Research: F&S Estimating Suite

## Critical Pitfalls (address early)

### 1. Stream idle timeout when writing large JSX files
**What**: Generating a file >400 lines in a single LLM response causes the API stream to drop mid-write, producing a corrupted or incomplete file.
**Warning signs**: File ends abruptly, JSX is unclosed, browser throws parse error.
**Prevention**: Write each view file in max ~300-line chunks. Split views-secondary.jsx into Pass A (first 3 views) and Pass B (last 3 views + registration).
**Phase**: Phase 1 (immediate)

### 2. Supabase CDN auth token expiry
**What**: The Supabase JS CDN client stores the JWT in localStorage. After ~1 hour, the token expires. Without a refresh handler, all DB calls silently fail returning null.
**Warning signs**: Data stops loading after an hour; no console error.
**Prevention**: Call `window.db.auth.onAuthStateChange()` on app init to auto-refresh. Use `window.db.auth.getSession()` before any fetch to ensure token is valid.
**Phase**: Phase 2 (Supabase setup)

### 3. html2canvas font rendering failure
**What**: html2canvas cannot capture web fonts (Google Fonts) loaded via `@font-face`. The PDF renders in a fallback serif font instead of Inter/JetBrains Mono.
**Warning signs**: PDF looks completely different from screen render.
**Prevention**: For the proposal print div, use `font-family: Arial, sans-serif` and `font-family: 'Courier New', monospace`. Don't rely on web fonts in the capture div. Or use jsPDF's built-in text API instead of html2canvas for critical text sections.
**Phase**: Phase 4 (PDF)

### 4. Supabase RLS blocking all queries
**What**: Enabling RLS without creating policies locks out all users. Easy to enable, easy to forget the policy.
**Warning signs**: All queries return empty arrays, no error — just silence.
**Prevention**: After enabling RLS, immediately add the blanket authenticated policy. Test with a logged-in user before moving on.
**Phase**: Phase 2

### 5. window.Views registration order
**What**: Each JSX file registers views via `window.Views = Object.assign(window.Views || {}, {...})`. If a file loads before `shell.jsx` defines `window.Icon`, the file will error.
**Warning signs**: `window.Icon is undefined` in console.
**Prevention**: index.html must load shell.jsx first, then view files. Already handled in current index.html — don't reorder.
**Phase**: Phase 1

---

## Common Mistakes

### Tech
- **Babel standalone re-transpiling on every load**: Each JSX file is transpiled in-browser on page load. With 6 large view files, this adds 2-4 seconds to first load. Acceptable for internal tool; not acceptable for public app.
- **No client-side router**: `window.__go(id)` changes the view but doesn't update the URL. Back button does nothing. Deep links don't work. This is acceptable for a 4-10 person internal tool but must be communicated clearly.
- **CORS for Supabase Storage**: Fetching files for preview requires CORS headers on the bucket. Set bucket to allow the app's origin, or use Supabase's signed URLs.
- **Supabase realtime subscription leaks**: If a view subscribes to realtime changes in `useEffect` without returning a cleanup function, each re-render adds another listener. Use `return () => subscription.unsubscribe()`.

### Data Model
- **Not versioning bids**: Estimators revise bids. Without a `version` integer on bids, revision history is lost. Schema includes `version` — always increment on duplicate, never overwrite.
- **Storing computed totals**: Don't store `subtotal` or `total` in the DB — derive them on read. Stored totals go stale when line items change.
- **Not linking line items to library**: When a library price changes, active bids should not silently update. The `library_item_id` FK is optional — treat it as "this was priced from library at time of entry" not as a live link.
- **CO amounts without job contract update**: When a CO is approved, `jobs.contract_val` must be updated. Easy to forget.

### UX
- **Dense tables without sticky headers**: The `.wf` table pattern has sticky headers via CSS. Don't remove `position: sticky` from `thead`.
- **No loading states**: When wiring to Supabase, always show a skeleton or spinner while data loads. Blank white flash feels broken.
- **No empty states**: An empty table with no message looks like a bug. Always show "No jobs yet" / "Add your first contact" etc.

### Performance
- **Fetching all line items for all bids**: Only fetch line items for the currently open bid. A job with 50 bids × 200 line items each = 10,000 rows on load.
- **Large plan set uploads**: Browser FileReader can handle 100MB but will freeze the UI thread during read. Use a progress indicator and consider chunked uploads for files >10MB.

---

## Prevention Strategies

| Pitfall | Prevention |
|---------|-----------|
| Stream timeout | Max 300 lines per write, split files into passes |
| Auth token expiry | `onAuthStateChange` handler in supabase.js init |
| Font rendering in PDF | Use system fonts in proposal div |
| RLS silently blocking | Add policy immediately after enabling RLS |
| Realtime leaks | Always return cleanup from useEffect subscriptions |
| Stale computed totals | Never store totals; always derive from line_items |
| CO/contract sync | Trigger `jobs.contract_val` update on CO approval |
| Missing loading states | Every Supabase fetch has a loading boolean in state |

---

## Phase Mapping

| Pitfall | Phase to Address |
|---------|-----------------|
| Stream timeout | Phase 1 (write strategy) |
| window.Views order | Phase 1 (already correct) |
| RLS setup | Phase 2 |
| Auth token refresh | Phase 2 |
| Realtime leaks | Phase 3 (when wiring views) |
| Stale totals | Phase 2 (schema design) |
| CO/contract sync | Phase 5 (workflow wiring) |
| Font rendering | Phase 4 (PDF) |
| CORS for Storage | Phase 6 (Docs upload) |
| Performance (pagination) | Phase 3 (fetch strategy) |
