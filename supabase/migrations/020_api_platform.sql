-- Migration 020: API Platform
-- API keys, rate limiting, webhook endpoints

-- ============================================================
-- API KEYS
-- ============================================================

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  rate_limit integer NOT NULL DEFAULT 1000,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_keys_school ON api_keys(school_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- ============================================================
-- WEBHOOK ENDPOINTS
-- ============================================================

CREATE TABLE webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_endpoints_school ON webhook_endpoints(school_id);

-- ============================================================
-- WEBHOOK DELIVERY LOG
-- ============================================================

CREATE TABLE webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  response_status integer,
  response_body text,
  attempts integer NOT NULL DEFAULT 0,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);

-- ============================================================
-- API USAGE LOG
-- ============================================================

CREATE TABLE api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  method text NOT NULL,
  path text NOT NULL,
  status_code integer,
  response_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_usage_key ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_created ON api_usage_logs(created_at);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "API keys: school admin manage" ON api_keys
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal') AND sm.is_active = true
    ) OR is_super_admin()
  );

CREATE POLICY "Webhook endpoints: school admin manage" ON webhook_endpoints
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal') AND sm.is_active = true
    ) OR is_super_admin()
  );

CREATE POLICY "Webhook deliveries: school admin read" ON webhook_deliveries
  FOR SELECT USING (
    endpoint_id IN (
      SELECT we.id FROM webhook_endpoints we
      WHERE we.school_id IN (SELECT get_user_school_ids())
    ) OR is_super_admin()
  );

CREATE POLICY "API usage: school admin read" ON api_usage_logs
  FOR SELECT USING (
    api_key_id IN (
      SELECT ak.id FROM api_keys ak
      WHERE ak.school_id IN (SELECT get_user_school_ids())
    ) OR is_super_admin()
  );
