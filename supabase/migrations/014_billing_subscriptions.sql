-- Migration 014: Billing & Subscriptions
-- Platform subscription system: plans, subscriptions, billing invoices

-- ============================================================
-- PLANS
-- ============================================================

CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price_monthly integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  max_students integer NOT NULL DEFAULT 50,
  max_staff integer NOT NULL DEFAULT 10,
  features jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active);

-- ============================================================
-- SUBSCRIPTIONS (one active per school)
-- ============================================================

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id),
  status text NOT NULL DEFAULT 'trialing',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  trial_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One active subscription per school (partial unique index)
CREATE UNIQUE INDEX idx_subscriptions_school_active ON subscriptions(school_id)
  WHERE status IN ('trialing', 'active', 'past_due');

CREATE INDEX idx_subscriptions_school ON subscriptions(school_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================
-- SUBSCRIPTION EVENTS (webhook idempotency)
-- ============================================================

CREATE TABLE subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_event_id)
);

CREATE INDEX idx_subscription_events_subscription ON subscription_events(subscription_id);

-- ============================================================
-- BILLING INVOICES
-- ============================================================

CREATE TABLE billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  status text NOT NULL DEFAULT 'pending',
  billing_reason text,
  provider_invoice_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_invoices_school ON billing_invoices(school_id);
CREATE INDEX idx_billing_invoices_subscription ON billing_invoices(subscription_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

-- Plans: readable by everyone (needed for plan selection UI)
CREATE POLICY "Plans: public read" ON plans
  FOR SELECT USING (true);

-- Plans: super admin manages
CREATE POLICY "Plans: super admin manage" ON plans
  FOR ALL USING (is_super_admin());

-- Subscriptions: school members read, super admin manages
CREATE POLICY "Subscriptions: school members read" ON subscriptions
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "Subscriptions: super admin manage" ON subscriptions
  FOR ALL USING (is_super_admin());

-- Subscription events: super admin reads (webhook audit)
CREATE POLICY "Subscription events: super admin read" ON subscription_events
  FOR SELECT USING (is_super_admin());

-- Billing invoices: school members read, super admin manages
CREATE POLICY "Billing invoices: school members read" ON billing_invoices
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "Billing invoices: super admin manage" ON billing_invoices
  FOR ALL USING (is_super_admin());

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED PLANS
-- ============================================================

INSERT INTO plans (name, slug, price_monthly, max_students, max_staff, features, sort_order) VALUES
  ('Free', 'free', 0, 25, 5,
    '{"attendance": true, "academics": true, "timetable": true, "fees": false, "reports": false, "admissions": false, "messaging": false}',
    0),
  ('Starter', 'starter', 300000, 250, 25,
    '{"attendance": true, "academics": true, "timetable": true, "fees": true, "reports": true, "admissions": true, "messaging": true}',
    1),
  ('Pro', 'pro', 600000, 1000, 100,
    '{"attendance": true, "academics": true, "timetable": true, "fees": true, "reports": true, "admissions": true, "messaging": true, "ai": true, "api": true}',
    2),
  ('Enterprise', 'enterprise', 1500000, -1, -1,
    '{"attendance": true, "academics": true, "timetable": true, "fees": true, "reports": true, "admissions": true, "messaging": true, "ai": true, "api": true, "custom_roles": true, "website_builder": true}',
    3)
ON CONFLICT (slug) DO NOTHING;
