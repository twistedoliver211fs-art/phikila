-- Migration 021: Platform Admin
-- System settings, platform-wide configuration

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  category text NOT NULL DEFAULT 'general',
  is_public boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PLATFORM ANALYTICS (aggregated, not per-school)
-- ============================================================

CREATE TABLE platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  dimensions jsonb NOT NULL DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_analytics_type ON platform_analytics(metric_type);
CREATE INDEX idx_platform_analytics_recorded ON platform_analytics(recorded_at);

-- ============================================================
-- SEED DEFAULT SETTINGS
-- ============================================================

INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('platform_name', '"Decimal"', 'Platform display name', 'general', true),
  ('platform_version', '"0.2.0"', 'Current platform version', 'general', true),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'system', false),
  ('max_schools_free', '1', 'Max schools on free plan', 'billing', false),
  ('default_trial_days', '14', 'Default trial period', 'billing', false),
  ('allowed_file_types', '["image/jpeg","image/png","image/gif","application/pdf","text/csv"]', 'Allowed upload file types', 'uploads', false),
  ('max_upload_size_mb', '10', 'Maximum file upload size in MB', 'uploads', false);
