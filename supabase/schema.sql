-- F&S Estimating Suite — Full Database Schema
-- Apply this in Supabase Dashboard → SQL Editor → Run
-- All tables use RLS: authenticated users have full read/write access

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Shop'
    CHECK (status IN ('Shop', 'Ready', 'Installing', 'Installed', 'Held')),
  bid_id uuid,
  address text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON jobs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- BIDS
-- ============================================================
CREATE TABLE bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  name text NOT NULL,
  stage text NOT NULL DEFAULT 'ITB'
    CHECK (stage IN ('ITB', 'Takeoff/Pricing', 'Review', 'Submit', 'Won', 'Lost')),
  due_date date,
  total numeric(12,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON bids
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add FK from jobs to bids after both tables exist
ALTER TABLE jobs ADD CONSTRAINT jobs_bid_id_fkey
  FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE SET NULL;

-- ============================================================
-- LINE_ITEMS
-- ============================================================
CREATE TABLE line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id uuid NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  section text,
  description text NOT NULL,
  qty numeric(12,3),
  unit text CHECK (unit IN ('EA','LF','SF','SY','CY','LS','HR','TON')),
  unit_cost numeric(12,2),
  total numeric(12,2) GENERATED ALWAYS AS (COALESCE(qty, 0) * COALESCE(unit_cost, 0)) STORED,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON line_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  role text CHECK (role IN ('gc','owner','sub','field')),
  email text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- LIBRARY_ITEMS
-- ============================================================
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

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON library_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- CHANGE_ORDERS
-- ============================================================
CREATE TABLE change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  number text NOT NULL,
  description text NOT NULL,
  amount numeric(12,2),
  status text DEFAULT 'Pending'
    CHECK (status IN ('Pending','Approved','Rejected')),
  issued_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON change_orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  bid_id uuid REFERENCES bids(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text,
  doc_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- ACTIVITY_LOG
-- ============================================================
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON activity_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
