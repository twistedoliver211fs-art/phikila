-- Migration 022: RLS for platform admin tables
--
-- system_settings and platform_analytics were created in 021 without
-- Row-Level Security. RLS is off by default, which means both tables were
-- directly readable AND writable by the public anon key through PostgREST
-- (the app itself only touches them via the super-admin-gated, service-role
-- /api/platform route).
--
-- This migration enables RLS and restricts both tables to super admins.

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings: super admin manage"
  ON system_settings FOR ALL
  USING (is_super_admin());

CREATE POLICY "platform_analytics: super admin manage"
  ON platform_analytics FOR ALL
  USING (is_super_admin());