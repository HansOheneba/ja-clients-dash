-- Client handover journal and advisor-only internal documents

CREATE TABLE IF NOT EXISTS wealth.client_advisor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_advisor_id uuid REFERENCES wealth.advisors(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_advisor_notes_client_idx
  ON wealth.client_advisor_notes (client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS wealth.client_internal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  storage_path text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/pdf',
  file_size_bytes bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by_advisor_id uuid REFERENCES wealth.advisors(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_internal_documents_client_idx
  ON wealth.client_internal_documents (client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS wealth.client_note_attachments (
  note_id uuid NOT NULL REFERENCES wealth.client_advisor_notes(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES wealth.client_internal_documents(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, document_id)
);

INSERT INTO wealth.client_advisor_notes (client_id, body, created_at)
SELECT id, advisor_notes, now()
FROM wealth.clients
WHERE advisor_notes IS NOT NULL
  AND trim(advisor_notes) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM wealth.client_advisor_notes n WHERE n.client_id = clients.id
  );

ALTER TABLE wealth.client_advisor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.client_internal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.client_note_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_advisor_notes_advisor ON wealth.client_advisor_notes;
CREATE POLICY client_advisor_notes_advisor ON wealth.client_advisor_notes
  FOR ALL TO authenticated
  USING (wealth.is_advisor() OR EXISTS (
    SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (wealth.is_advisor() OR EXISTS (
    SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS client_internal_documents_advisor ON wealth.client_internal_documents;
CREATE POLICY client_internal_documents_advisor ON wealth.client_internal_documents
  FOR ALL TO authenticated
  USING (wealth.is_advisor() OR EXISTS (
    SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (wealth.is_advisor() OR EXISTS (
    SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS client_note_attachments_advisor ON wealth.client_note_attachments;
CREATE POLICY client_note_attachments_advisor ON wealth.client_note_attachments
  FOR ALL TO authenticated
  USING (wealth.is_advisor() OR EXISTS (
    SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (wealth.is_advisor() OR EXISTS (
    SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

GRANT SELECT, INSERT ON wealth.client_advisor_notes TO authenticated;
GRANT SELECT, INSERT ON wealth.client_internal_documents TO authenticated;
GRANT SELECT, INSERT ON wealth.client_note_attachments TO authenticated;
GRANT ALL ON wealth.client_advisor_notes, wealth.client_internal_documents,
  wealth.client_note_attachments TO service_role;
