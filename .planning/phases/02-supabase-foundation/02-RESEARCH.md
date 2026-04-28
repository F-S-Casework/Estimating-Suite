# Phase 2: Supabase Foundation — Research

**Phase:** 02-supabase-foundation
**Researched:** 2026-04-28
**Status:** RESEARCH COMPLETE

---

## 1. Supabase JS v2 CDN Initialization

### Loading via CDN
Supabase JS v2 UMD bundle is available at:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
This exposes `window.supabase` with `{ createClient }` destructured from it.

### Initialization pattern (supabase.js)
```js
// project/supabase.js — plain JS, no type="text/babel" needed
const SUPABASE_URL = 'https://YOURPROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';

const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Key points:
- `window.sb` is the global client used by all JSX files
- Must load after the Supabase CDN script tag, before any view scripts
- No ESM imports — everything via globals
- `createClient` accepts an optional 3rd options arg; defaults are fine for v2

### Script tag ordering in index.html
```html
<!-- 1. Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- 2. Config/client init (plain JS) -->
<script src="project/supabase.js"></script>
<!-- 3. Babel standalone -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<!-- 4. React, ReactDOM -->
<!-- 5. App JSX files (type="text/babel") -->
```
supabase.js must run before Babel processes JSX, since JSX files reference `window.sb`.

---

## 2. Authentication — signInWithPassword

### API
```js
const { data, error } = await window.sb.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secret'
});
// data.session — Session object or null
// data.user — User object or null
// error — AuthApiError or null
```

### Error handling (D-05)
```js
if (error) {
  // error.message is human-readable: "Invalid login credentials"
  // For UI: show "Invalid email or password" regardless of actual error
  setErrMsg('Invalid email or password');
  return;
}
```
Do NOT expose `error.message` directly — standardize to "Invalid email or password" to avoid email enumeration.

### Sign out
```js
await window.sb.auth.signOut();
// Returns { error } — error is null on success
```

---

## 3. Session Persistence

Supabase JS v2 **auto-persists sessions to localStorage by default** — no extra config needed.

- Key stored: `sb-{project-ref}-auth-token`
- On page refresh: `createClient` reads localStorage automatically and restores the session
- `onAuthStateChange` fires `INITIAL_SESSION` event on load with the restored session (or null)

To disable: `createClient(URL, KEY, { auth: { persistSession: false } })` — we do NOT want this (D-06).

---

## 4. onAuthStateChange — Auth Gate Pattern

### API
```js
const { data: { subscription } } = window.sb.auth.onAuthStateChange((event, session) => {
  // event: 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED'
  // session: Session | null
});

// Cleanup:
subscription.unsubscribe();
```

### Auth gate in app.jsx (CDN React pattern)
```jsx
function App() {
  const [session, setSession] = React.useState(undefined); // undefined = loading

  React.useEffect(() => {
    const { data: { subscription } } = window.sb.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // loading — avoid flash
  if (!session) return <LoginView />;
  return <Shell />;
}
```

Key points:
- `undefined` initial state prevents flash of login or app
- No separate `getSession()` call needed — `INITIAL_SESSION` event handles initial state
- Auth gate lives in app.jsx (root), not shell.jsx

### Logout from topbar (D-06)
```jsx
// In Shell or a UserMenu component
async function handleLogout() {
  await window.sb.auth.signOut();
  // onAuthStateChange fires SIGNED_OUT → session becomes null → LoginView renders
}
```

---

## 5. Config Storage (D-03, D-04)

For internal tools where the anon key is acceptable in source:
```js
// project/supabase.js
const SUPABASE_URL = 'https://YOURPROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

The anon key is safe to expose: it only grants what RLS policies allow. RLS will enforce authenticated access to all tables.

---

## 6. Database Schema — 8 Tables

### Design decisions (from CONTEXT.md)
- D-07: Bid stages: `ITB`, `Takeoff/Pricing`, `Review`, `Submit`, `Won`, `Lost`
- D-08: Job statuses: `Active`, `On Hold`, `Complete`, `Cancelled`
- D-09: Contact roles: `Owner`, `GC`, `Architect`, `Engineer`, `Sub`, `Supplier`, `Other`
- D-10: Bid numbers: `Q-YY-NNN` (e.g., `Q-25-001`)
- D-11: Job numbers: `YY-NNN` (e.g., `25-001`, separate sequence)
- D-12: Line item units: `EA`, `LF`, `SF`, `SY`, `CY`, `LS`, `HR`, `TON`

### Table definitions

#### jobs
```sql
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,            -- YY-NNN format
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Active'   -- Active|On Hold|Complete|Cancelled
    CHECK (status IN ('Active', 'On Hold', 'Complete', 'Cancelled')),
  bid_id uuid REFERENCES bids(id),        -- originating bid (nullable)
  address text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### bids
```sql
CREATE TABLE bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,            -- Q-YY-NNN format
  name text NOT NULL,
  stage text NOT NULL DEFAULT 'ITB'
    CHECK (stage IN ('ITB', 'Takeoff/Pricing', 'Review', 'Submit', 'Won', 'Lost')),
  due_date date,
  total numeric(12,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### line_items
```sql
CREATE TABLE line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id uuid NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  section text,
  description text NOT NULL,
  qty numeric(12,3),
  unit text CHECK (unit IN ('EA','LF','SF','SY','CY','LS','HR','TON')),
  unit_cost numeric(12,2),
  total numeric(12,2) GENERATED ALWAYS AS (qty * unit_cost) STORED,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

#### contacts
```sql
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  role text CHECK (role IN ('Owner','GC','Architect','Engineer','Sub','Supplier','Other')),
  email text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### library_items
```sql
CREATE TABLE library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  description text NOT NULL,
  unit text CHECK (unit IN ('EA','LF','SF','SY','CY','LS','HR','TON')),
  unit_cost numeric(12,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### change_orders
```sql
CREATE TABLE change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  number text NOT NULL,
  description text NOT NULL,
  amount numeric(12,2),
  status text DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
  issued_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### documents
```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  bid_id uuid REFERENCES bids(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text,                      -- Supabase Storage path (Phase 5)
  doc_type text,                          -- e.g. 'proposal', 'contract', 'plan'
  created_at timestamptz DEFAULT now()
);
```

#### activity_log
```sql
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,              -- 'job' | 'bid' | 'contact' etc.
  entity_id uuid NOT NULL,
  action text NOT NULL,                   -- 'created' | 'updated' | 'stage_changed' etc.
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
```

---

## 7. RLS Policies

### Enable RLS on all tables
```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
```

### Policy pattern — authenticated full access
```sql
-- Template for each table:
CREATE POLICY "authenticated_full_access" ON {table}
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

`USING (true)` allows SELECT/DELETE on any row.
`WITH CHECK (true)` allows INSERT/UPDATE on any row.
`TO authenticated` restricts to signed-in users — anon users get nothing.

### Apply to all 8 tables
```sql
CREATE POLICY "authenticated_full_access" ON jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON bids FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON line_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON library_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON change_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## 8. Login View — Component Pattern (CDN React)

### Minimal form matching D-01
```jsx
function LoginView() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid email or password');
    setLoading(false);
    // On success: onAuthStateChange in app.jsx handles the redirect automatically
  }

  return (
    <div className="login-wrap">
      <h1 className="login-title">F&amp;S Estimating Suite</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" required autoFocus />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" required />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
window.Views = Object.assign(window.Views || {}, { login: LoginView });
```

---

## 9. Logout in Shell Topbar

### app.jsx integration pattern
Pass `onLogout` down from App to Shell, or have Shell call `window.sb.auth.signOut()` directly (simpler given CDN globals pattern):

```jsx
// In Shell or topbar component:
async function handleLogout() {
  await window.sb.auth.signOut();
  // onAuthStateChange fires automatically in app.jsx → session → null → LoginView
}
```

---

## 10. Validation Architecture

### Test approach
Since there's no test runner (CDN-only), validation is manual/visual:

1. **Auth gate:** Visit app logged out → login screen shown; no nav visible
2. **Login success:** Valid creds → Home view shown; nav visible
3. **Login failure:** Wrong creds → "Invalid email or password" shown inline
4. **Session persistence:** After login, reload page → still logged in
5. **Logout:** Avatar menu → logout → login screen shown
6. **RLS:** Attempt Supabase query as anon (no session) → 401/empty result
7. **Schema:** All 8 tables visible in Supabase dashboard table editor

---

## Key Implementation Notes

1. **Script order matters:** supabase.js must load after CDN script but before Babel processes JSX
2. **No flash of login/app:** Use `undefined` initial session state (null = logged out, session = logged in, undefined = loading)
3. **app.jsx vs shell.jsx:** Auth gate goes in app.jsx; Shell only renders when authenticated
4. **Generated column gotcha:** `line_items.total` uses `GENERATED ALWAYS AS` — do not INSERT/UPDATE this column
5. **Updated_at triggers:** Add `updated_at` triggers or update manually; Supabase doesn't auto-update timestamps
6. **Supabase JS v2 import path:** Use `window.supabase` not `window.supabase.default` — v2 UMD exports at root

## RESEARCH COMPLETE
