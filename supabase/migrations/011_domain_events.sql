-- Migration 011: Domain Events
-- Centralized event system for all state changes

CREATE TABLE domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id),
  resource_type text NOT NULL,
  resource_id uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_domain_events_school ON domain_events(school_id);
CREATE INDEX idx_domain_events_type ON domain_events(event_type);
CREATE INDEX idx_domain_events_created ON domain_events(created_at DESC);
CREATE INDEX idx_domain_events_resource ON domain_events(resource_type, resource_id);
CREATE INDEX idx_domain_events_actor ON domain_events(actor_user_id);

-- RLS: school members can read their school's events, super_admin sees all
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events: school members read" ON domain_events
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

-- Writes only via service-role client (no INSERT/UPDATE/DELETE policies for anon/authenticated)
