-- WM platform: compliance fields, audit trail, sessions, documents, messages, report extensions

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'review_cadence' AND n.nspname = 'wealth'
  ) THEN
    CREATE TYPE wealth.review_cadence AS ENUM ('quarterly', 'semi_annual', 'annual');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'session_request_status' AND n.nspname = 'wealth'
  ) THEN
    CREATE TYPE wealth.session_request_status AS ENUM ('pending', 'accepted', 'declined', 'rescheduled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'session_status' AND n.nspname = 'wealth'
  ) THEN
    CREATE TYPE wealth.session_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'document_request_status' AND n.nspname = 'wealth'
  ) THEN
    CREATE TYPE wealth.document_request_status AS ENUM ('pending', 'uploaded', 'expired');
  END IF;
END $$;

ALTER TABLE wealth.clients
  ADD COLUMN IF NOT EXISTS review_cadence wealth.review_cadence,
  ADD COLUMN IF NOT EXISTS next_review_date date,
  ADD COLUMN IF NOT EXISTS last_contact_date date,
  ADD COLUMN IF NOT EXISTS risk_assessed_at date;

CREATE TABLE IF NOT EXISTS wealth.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  before_value jsonb,
  after_value jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_target_idx
  ON wealth.audit_log (target_type, target_id, created_at DESC);

CREATE TABLE IF NOT EXISTS wealth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL REFERENCES wealth.advisors(id) ON DELETE CASCADE,
  session_request_id uuid,
  title text NOT NULL DEFAULT 'Advisory session',
  scheduled_at timestamptz,
  status wealth.session_status NOT NULL DEFAULT 'confirmed',
  format text NOT NULL DEFAULT 'video',
  recap_topics text[] NOT NULL DEFAULT '{}',
  recap_decisions text[] NOT NULL DEFAULT '{}',
  recap_action_items text[] NOT NULL DEFAULT '{}',
  recap_next_steps text[] NOT NULL DEFAULT '{}',
  recap_logged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_advisor_scheduled_idx
  ON wealth.sessions (advisor_id, scheduled_at);
CREATE INDEX IF NOT EXISTS sessions_client_idx
  ON wealth.sessions (client_id, scheduled_at DESC);

ALTER TABLE wealth.session_requests
  ADD COLUMN IF NOT EXISTS status wealth.session_request_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS proposed_times text,
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES wealth.sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS response_note text;

UPDATE wealth.session_requests SET status = 'pending' WHERE status IS NULL;

CREATE TABLE IF NOT EXISTS wealth.document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL REFERENCES wealth.advisors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  due_date date,
  status wealth.document_request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS document_requests_advisor_due_idx
  ON wealth.document_requests (advisor_id, due_date);

ALTER TABLE wealth.vault_documents
  ADD COLUMN IF NOT EXISTS expires_on date,
  ADD COLUMN IF NOT EXISTS document_request_id uuid REFERENCES wealth.document_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS uploaded_by_role text NOT NULL DEFAULT 'advisor';

CREATE TABLE IF NOT EXISTS wealth.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES wealth.clients(id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL REFERENCES wealth.advisors(id) ON DELETE CASCADE,
  advisor_last_read_at timestamptz,
  client_last_read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wealth.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES wealth.message_threads(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('advisor', 'client')),
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  attachment_type text,
  attachment_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_thread_idx
  ON wealth.messages (thread_id, created_at ASC);

ALTER TABLE wealth.reports
  ADD COLUMN IF NOT EXISTS sections jsonb,
  ADD COLUMN IF NOT EXISTS template_key text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz;

ALTER TABLE wealth.client_goals
  ADD COLUMN IF NOT EXISTS linked_bucket wealth.portfolio_bucket;

ALTER TABLE wealth.advisors
  ADD COLUMN IF NOT EXISTS notify_sessions text NOT NULL DEFAULT 'instant',
  ADD COLUMN IF NOT EXISTS notify_documents text NOT NULL DEFAULT 'instant',
  ADD COLUMN IF NOT EXISTS notify_messages text NOT NULL DEFAULT 'instant';

-- RLS
ALTER TABLE wealth.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_log_advisor_select ON wealth.audit_log;
CREATE POLICY audit_log_advisor_select ON wealth.audit_log
  FOR SELECT TO authenticated
  USING (wealth.is_advisor() OR EXISTS (
    SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS audit_log_advisor_insert ON wealth.audit_log;
CREATE POLICY audit_log_advisor_insert ON wealth.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (wealth.is_advisor());

DROP POLICY IF EXISTS sessions_select ON wealth.sessions;
CREATE POLICY sessions_select ON wealth.sessions
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR advisor_id = wealth.current_advisor_id()
    OR EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS sessions_advisor_write ON wealth.sessions;
CREATE POLICY sessions_advisor_write ON wealth.sessions
  FOR ALL TO authenticated
  USING (wealth.is_advisor())
  WITH CHECK (wealth.is_advisor());

DROP POLICY IF EXISTS document_requests_select ON wealth.document_requests;
CREATE POLICY document_requests_select ON wealth.document_requests
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR advisor_id = wealth.current_advisor_id()
    OR EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS document_requests_advisor_write ON wealth.document_requests;
CREATE POLICY document_requests_advisor_write ON wealth.document_requests
  FOR ALL TO authenticated
  USING (wealth.is_advisor())
  WITH CHECK (wealth.is_advisor());

DROP POLICY IF EXISTS message_threads_select ON wealth.message_threads;
CREATE POLICY message_threads_select ON wealth.message_threads
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR advisor_id = wealth.current_advisor_id()
    OR EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS message_threads_write ON wealth.message_threads;
CREATE POLICY message_threads_write ON wealth.message_threads
  FOR ALL TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR advisor_id = wealth.current_advisor_id()
    OR wealth.is_advisor()
  )
  WITH CHECK (
    client_id = wealth.current_client_id()
    OR advisor_id = wealth.current_advisor_id()
    OR wealth.is_advisor()
  );

DROP POLICY IF EXISTS messages_select ON wealth.messages;
CREATE POLICY messages_select ON wealth.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wealth.message_threads t
      WHERE t.id = thread_id
        AND (
          t.client_id = wealth.current_client_id()
          OR t.advisor_id = wealth.current_advisor_id()
        )
    )
    OR EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS messages_insert ON wealth.messages;
CREATE POLICY messages_insert ON wealth.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wealth.message_threads t
      WHERE t.id = thread_id
        AND (
          t.client_id = wealth.current_client_id()
          OR t.advisor_id = wealth.current_advisor_id()
        )
    )
  );

DROP POLICY IF EXISTS session_requests_advisor_update ON wealth.session_requests;
CREATE POLICY session_requests_advisor_update ON wealth.session_requests
  FOR UPDATE TO authenticated
  USING (advisor_id = wealth.current_advisor_id() OR wealth.is_advisor())
  WITH CHECK (advisor_id = wealth.current_advisor_id() OR wealth.is_advisor());

GRANT SELECT, INSERT ON wealth.audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wealth.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wealth.document_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON wealth.message_threads TO authenticated;
GRANT SELECT, INSERT ON wealth.messages TO authenticated;
GRANT ALL ON wealth.audit_log, wealth.sessions, wealth.document_requests,
  wealth.message_threads, wealth.messages TO service_role;

-- Realtime for messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'wealth' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wealth.messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
