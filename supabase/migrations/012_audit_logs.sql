-- Migration 012: Audit Logging
-- Comprehensive audit trail for all significant actions

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id),
  actor_email text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_audit_logs_school ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- RLS: school members can read their school's audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit: school members read" ON audit_logs
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

-- No INSERT/UPDATE/DELETE policies — only service-role can write audit logs
-- This prevents tampering with the audit trail
