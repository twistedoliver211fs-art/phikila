-- Migration 019: Document Management
-- File uploads, categories, access control

-- ============================================================
-- DOCUMENT CATEGORIES
-- ============================================================

CREATE TABLE document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, name)
);

CREATE INDEX idx_doc_categories_school ON document_categories(school_id);

-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  category_id uuid REFERENCES document_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  is_public boolean NOT NULL DEFAULT false,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_school ON documents(school_id);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_uploaded ON documents(uploaded_by);

-- ============================================================
-- DOCUMENT ACCESS (who can view/download)
-- ============================================================

CREATE TABLE document_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_view boolean NOT NULL DEFAULT true,
  can_download boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  UNIQUE(document_id, user_id)
);

CREATE INDEX idx_doc_access_document ON document_access(document_id);
CREATE INDEX idx_doc_access_user ON document_access(user_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doc categories: school read" ON document_categories
  FOR SELECT USING (school_id IN (SELECT get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Doc categories: admin manage" ON document_categories
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'secretary') AND sm.is_active = true
    )
  );

CREATE POLICY "Documents: school read" ON documents
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "Documents: admin manage" ON documents
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'secretary') AND sm.is_active = true
    )
  );

CREATE POLICY "Document access: admin manage" ON document_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_access.document_id
        AND d.school_id IN (
          SELECT sm.school_id FROM school_members sm
          WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal') AND sm.is_active = true
        )
    )
  );
