-- Migration 015: Financial Ledger
-- Invoices, ledger entries, receipts for school fee management

-- ============================================================
-- FEE CATEGORIES
-- ============================================================

CREATE TABLE fee_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, name)
);

CREATE INDEX idx_fee_categories_school ON fee_categories(school_id);

-- ============================================================
-- INVOICES
-- ============================================================

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id uuid NOT NULL REFERENCES fee_structures(id),
  invoice_number text NOT NULL,
  amount_due decimal(12,2) NOT NULL,
  amount_paid decimal(12,2) NOT NULL DEFAULT 0,
  discount decimal(12,2) NOT NULL DEFAULT 0,
  balance decimal(12,2) GENERATED ALWAYS AS (amount_due - amount_paid - discount) STORED,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  term_id uuid REFERENCES terms(id),
  academic_year_id uuid REFERENCES academic_years(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, invoice_number)
);

CREATE INDEX idx_invoices_school ON invoices(school_id);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date) WHERE status IN ('pending', 'partial');

-- ============================================================
-- LEDGER ENTRIES (append-only financial record)
-- ============================================================

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id),
  payment_id uuid REFERENCES payments(id),
  entry_type text NOT NULL,
  amount decimal(12,2) NOT NULL,
  balance_after decimal(12,2) NOT NULL,
  description text,
  reference text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ledger_entries_school ON ledger_entries(school_id);
CREATE INDEX idx_ledger_entries_student ON ledger_entries(student_id);
CREATE INDEX idx_ledger_entries_invoice ON ledger_entries(invoice_id);
CREATE INDEX idx_ledger_entries_created ON ledger_entries(created_at);

-- ============================================================
-- RECEIPTS
-- ============================================================

CREATE TABLE receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  receipt_number text NOT NULL,
  payment_id uuid NOT NULL REFERENCES payments(id),
  invoice_id uuid REFERENCES invoices(id),
  student_id uuid NOT NULL REFERENCES students(id),
  amount decimal(12,2) NOT NULL,
  payment_method text,
  reference text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, receipt_number)
);

CREATE INDEX idx_receipts_school ON receipts(school_id);
CREATE INDEX idx_receipts_student ON receipts(student_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Fee categories: school members read, admin/principal manage
CREATE POLICY "Fee categories: school members read" ON fee_categories
  FOR SELECT USING (school_id IN (SELECT get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Fee categories: admin manage" ON fee_categories
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal') AND sm.is_active = true
    )
  );

-- Invoices: school members read, admin/finance manage
CREATE POLICY "Invoices: school members read" ON invoices
  FOR SELECT USING (school_id IN (SELECT get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Invoices: admin manage" ON invoices
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'finance') AND sm.is_active = true
    )
  );

-- Ledger entries: school members read, admin/finance insert only
CREATE POLICY "Ledger: school members read" ON ledger_entries
  FOR SELECT USING (school_id IN (SELECT get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Ledger: admin insert" ON ledger_entries
  FOR INSERT WITH CHECK (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'finance') AND sm.is_active = true
    )
  );

-- Receipts: school members read, admin/finance manage
CREATE POLICY "Receipts: school members read" ON receipts
  FOR SELECT USING (school_id IN (SELECT get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Receipts: admin manage" ON receipts
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'finance') AND sm.is_active = true
    )
  );

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
