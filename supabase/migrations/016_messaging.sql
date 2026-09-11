-- Migration 016: Enhanced Messaging
-- Conversations, participants, message threading

-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_school ON conversations(school_id);

-- ============================================================
-- CONVERSATION PARTICIPANTS
-- ============================================================

CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);

-- ============================================================
-- ENHANCE MESSAGES TABLE
-- ============================================================

ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'direct';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_id) WHERE read_at IS NULL;

-- ============================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversations: participants can read, school members can create
CREATE POLICY "Conversations: participants read" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT cp.conversation_id FROM conversation_participants cp
      JOIN school_members sm ON sm.user_id = cp.user_id
      WHERE sm.user_id = auth.uid() AND sm.is_active = true
    ) OR is_super_admin()
  );

CREATE POLICY "Conversations: school members create" ON conversations
  FOR INSERT WITH CHECK (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

-- Conversation participants: participants can read
CREATE POLICY "Conv participants: participants read" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT cp2.conversation_id FROM conversation_participants cp2
      WHERE cp2.user_id = auth.uid()
    ) OR is_super_admin()
  );

CREATE POLICY "Conv participants: school members manage" ON conversation_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND c.school_id IN (SELECT get_user_school_ids())
    ) OR is_super_admin()
  );
