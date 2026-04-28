# Phase 2: Supabase Foundation — Pattern Map

**Phase:** 02-supabase-foundation
**Created:** 2026-04-28

---

## Critical Discovery: No app.jsx

The ROADMAP references `project/app.jsx` but **this file does not exist**. The `App()` function lives inside `project/shell.jsx` (line 91). All auth gate modifications go in `shell.jsx`, not a separate app.jsx.

---

## Files To Create / Modify

### 1. `project/supabase.js` (CREATE)

**Role:** CDN client initialization. Plain JS (not text/babel). Must load after Supabase CDN script but before any JSX files.

**Analog:** No direct analog — this is the first plain JS config file. Pattern from research:
```js
const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Script tag position:** In `index.html`, goes after the Supabase CDN `<script>` but before `<script src="https://unpkg.com/@babel/standalone...">`.

---

### 2. `project/views-auth.jsx` (CREATE)

**Role:** LoginView component — rendered by App() when no session.

**Closest analog:** `project/views-home.jsx` — same file structure, same `window.Views` registration at bottom.

**Registration pattern** (from views-home.jsx line 253):
```js
window.Views = Object.assign(window.Views || {}, { home: HomeView, pipeline: PipelineView });
```
→ For auth:
```js
window.Views = Object.assign(window.Views || {}, { login: LoginView });
```

**React hooks available:** `useState`, `useEffect`, `useMemo`, `useRef` are destructured in `shell.jsx`'s opening line — available globally since shell.jsx loads first. No need to re-destructure in views.

---

### 3. `index.html` (MODIFY)

**Current script order** (lines 15–29):
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
<!-- Core shell + registered views -->
<script type="text/babel" src="project/shell.jsx"></script>
...
<script type="text/babel" src="project/views-bidhistory.jsx"></script>
<!-- Mount -->
<script type="text/babel">
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

**Required insertions:**
1. Before React CDN: add Supabase CDN tag
2. After Supabase CDN and before Babel: add `<script src="project/supabase.js"></script>`
3. After shell.jsx and before views-home.jsx: add `<script type="text/babel" src="project/views-auth.jsx"></script>`

---

### 4. `project/shell.jsx` — `App()` function (MODIFY)

**Current App() structure** (lines 91–160):
```jsx
function App() {
  const [active, setActive] = useState(() => {
    try { return localStorage.getItem('fs-view') || 'home'; } catch { return 'home'; }
  });
  const go = (id) => { setActive(id); try { localStorage.setItem('fs-view', id); } catch {} };
  useEffect(() => { window.__go = go; }, []);
  // ... crumb, actions, View ...
  return (
    <div id="app">
      <Topbar crumb={crumb} actions={actions} />
      <div id="main">
        <Rail active={active} onGo={go} />
        <main id="content">
          {View ? <View go={go} /> : <div style={{padding:40}}>Loading…</div>}
        </main>
      </div>
    </div>
  );
}
```

**Auth gate wraps the existing render.** New structure:
```jsx
function App() {
  const [session, setSession] = useState(undefined); // undefined=loading, null=logged out
  useEffect(() => {
    const { data: { subscription } } = window.sb.auth.onAuthStateChange((_ev, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  if (session === undefined) return null;
  if (!session) return <LoginView />;

  // ... existing active/go/crumb/actions/View logic unchanged below ...
}
```

---

### 5. `project/shell.jsx` — `Topbar` component (MODIFY)

**Current Topbar** (lines ~75–90):
```jsx
function Topbar({ crumb, actions }) {
  return (
    <header id="topbar">
      <div className="brand">...</div>
      <span className="sep">/</span>
      <div className="crumb">{crumb}</div>
      <div className="spacer"></div>
      <div className="search">...</div>
      {actions}
      <div className="avatar" title="Evan Pruitt">EP</div>
    </header>
  );
}
```

**Modification:** Replace static `<div className="avatar">` with a dropdown-capable version that shows logout option. Pass `onLogout` prop from App().

Pattern for logout dropdown:
```jsx
function Topbar({ crumb, actions, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  // ... existing code ...
  <div className="avatar" onClick={() => setShowMenu(v => !v)} title="Evan Pruitt">EP
    {showMenu && (
      <div className="avatar-menu">
        <button onClick={onLogout}>Sign out</button>
      </div>
    )}
  </div>
}
```

---

### 6. `supabase/schema.sql` (CREATE)

**Role:** Full DDL for all 8 tables + RLS policies. Run once in Supabase SQL editor.

**No existing analog** — first SQL file in the project. Directory `supabase/` must be created.

**Pattern from RESEARCH.md:** 8 tables with `gen_random_uuid()` PKs, `timestamptz DEFAULT now()` for timestamps, `FOR ALL TO authenticated USING (true) WITH CHECK (true)` RLS policy per table.

**Line_items gotcha:** `total` column is `GENERATED ALWAYS AS (qty * unit_cost) STORED` — do not insert/update this column from the app.

---

## Key Constraints for Planner

1. **No app.jsx** — everything goes in shell.jsx (App, Topbar)
2. **Script order is load-order** — supabase.js must precede any JSX that uses `window.sb`
3. **`const { useState, useEffect, ... } = React`** is at the top of shell.jsx (line 1) — already available to all JSX files loaded after shell
4. **`window.Views` registry** — login view registered as `window.Views.login` but App renders it directly (not via registry) since it's outside the authenticated shell
5. **`session === undefined`** initial state prevents flash — this is the null-check pattern for Supabase v2
6. **LoginView referenced directly** in App() — `<LoginView />` — so it must either be in shell.jsx or registered and called as `window.Views.login`
7. **Topbar needs `onLogout` prop** — App passes `() => window.sb.auth.signOut()` to Topbar; the sign-out triggers onAuthStateChange automatically
8. **supabase.js is plain JS**, not text/babel — no JSX, no React, just CDN init
