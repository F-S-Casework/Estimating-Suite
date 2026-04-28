# Architecture Research: F&S Estimating Suite

## Data Model

Core entities and relationships:

```
Library Items ─────────────────────────────────────────┐
                                                        │
Contacts ──────────────────────────────────────────┐   │
                                                   │   │
Jobs ──── Bids ──── Line Items (from Library) ─────┘   │
  │          │                                         │
  │          └──── Proposal (generated PDF)            │
  │                                                    │
  ├──── Change Orders                                  │
  ├──── Documents (Supabase Storage)                   │
  └──── Activity Log                                   │
                                                       │
  GCs/Owners/Subs ────────────────────────────────────┘
  (all in Contacts, typed by role)
```

Key relationships:
- A Job has one winning Bid (nullable until won)
- A Bid has many Line Items
- Line Items optionally reference a Library Item (for pricing sync)
- Change Orders belong to a Job and adjust the contract value
- Documents belong to a Job (plans, specs, submittals, RFIs)
- Contacts link to Jobs via GC/owner fields

## Supabase Schema

```sql
-- Core lookup / reference
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  role text,  -- 'gc' | 'owner' | 'sub' | 'field'
  phone text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  description text NOT NULL,
  category text,  -- 'Casework' | 'Hardware' | 'Finishing' | 'Glass' | 'Install'
  uom text,       -- 'LF' | 'EA' | 'SF' | 'HR'
  mat_cost numeric(10,2),
  labor_cost numeric(10,2),
  last_updated timestamptz DEFAULT now()
);

-- Jobs and bidding
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gc_id uuid REFERENCES contacts(id),
  owner text,
  pm text,
  status text DEFAULT 'prospect',  -- 'prospect'|'bidding'|'submitted'|'won'|'lost'
  bid_due timestamptz,
  contract_val numeric(12,2),
  install_start date,
  install_end date,
  crew_cap_pct integer,  -- 0-100
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  version integer DEFAULT 1,
  sent_date date,
  method text,  -- 'email' | 'portal' | 'hand'
  total numeric(12,2),
  direct_cost numeric(12,2),
  oh_pct numeric(5,2) DEFAULT 8.0,
  profit_pct numeric(5,2) DEFAULT 10.5,
  bond_pct numeric(5,2) DEFAULT 1.2,
  status text DEFAULT 'draft',  -- 'draft'|'sent'|'won'|'lost'
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id uuid REFERENCES bids(id) ON DELETE CASCADE,
  library_item_id uuid REFERENCES library_items(id),  -- nullable
  section text,
  code text,
  description text NOT NULL,
  uom text,
  qty numeric(10,3),
  unit_cost numeric(10,2),
  waste_pct numeric(5,2) DEFAULT 0,
  sub text,  -- subcontractor name if applicable
  sort_order integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  number integer,
  description text,
  amount numeric(12,2),
  status text DEFAULT 'pending',  -- 'pending'|'approved'|'rejected'
  submitted_at date,
  approved_at date,
  notes text
);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,  -- 'plans'|'specs'|'submittal'|'rfi'|'proposal'
  storage_path text,  -- Supabase Storage path
  file_size bigint,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text,  -- 'job'|'bid'|'co'|'doc'
  entity_id uuid,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

**RLS Policy approach**: For 4-10 users all seeing everything, simplest policy is:
```sql
-- Enable RLS but allow all authenticated users full access
CREATE POLICY "authenticated_full_access" ON jobs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Repeat for each table
```

## State Management (No-build-step)

Given CDN-only React (no Redux/Zustand/Context API packages):

**Pattern: Module-level state singletons + React useState/useEffect**

```js
// In supabase.js — a global data cache
window.AppState = {
  jobs: null,
  contacts: null,
  library: null,
  listeners: [],
  notify() { this.listeners.forEach(fn => fn()); },
  subscribe(fn) { this.listeners.push(fn); },
};
```

Each view:
1. `useEffect` on mount → fetch from `window.db` → store in local `useState`
2. Writes go to Supabase, then invalidate/refetch
3. No optimistic updates for v1 — keep it simple

For cross-view data (e.g., opening Estimator for a specific job):
```js
// In shell.jsx
window.__go = (viewId, params) => {
  window.__viewParams = params;  // stash params globally
  setActive(viewId);
};

// In EstimatorView
const jobId = window.__viewParams?.jobId;
```

## PDF Architecture

The proposal must be rendered as a styled HTML `<div>`, then captured:

```
<div id="proposal-root" style="width:816px; font-family:Inter;">
  <ProposalCover />        // Page 1
  <ProposalScope />        // Page 2: scope narrative
  <ProposalLineItems />    // Page 3+: sections with subtotals
  <ProposalSummary />      // Last: Direct, OH&P, Bond, Total, GM%
  <ProposalTandC />        // Terms
</div>
```

Key constraints:
- Width: 816px (US Letter at 96dpi)
- Use inline styles, not CSS classes (html2canvas renders computed styles)
- No web fonts loaded via `@font-face` at capture time — use system fonts or embed base64
- Page breaks: use `page-break-before: always` on section divs

Capture flow:
```js
async function downloadProposal() {
  const el = document.getElementById('proposal-root');
  el.style.display = 'block';
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'letter');
  // Add canvas as image, split across pages
  pdf.save(`proposal-${jobName}.pdf`);
  el.style.display = 'none';
}
```

## Storage Structure

```
Supabase Storage bucket: "project-docs"

project-docs/
  {job_id}/
    plans/
      {filename}.pdf
    specs/
      {filename}.pdf
    submittals/
      {filename}.pdf
    rfis/
      {filename}.pdf
    proposals/
      {filename}.pdf   ← generated PDFs saved here too
```

Access: authenticated users only (match RLS pattern).

## Build Order

```
Phase 1: App loads (views-secondary.jsx) ← CURRENT BLOCKER
    ↓
Phase 2: Supabase setup (schema, auth, client)
    ↓
Phase 3: Wire views to real data (replace sample data per view)
    ↓
Phase 4: PDF proposal (requires Estimator data to be real)
    ↓
Phase 5: Cross-view workflow (Pipeline→Estimator→Job handoff→CO)
    ↓
Phase 6: Docs upload to Storage
    ↓
Phase 7: Reports/Margin real aggregation queries
```

Phase 1 is a hard prerequisite — the app won't load without views-secondary.jsx.
