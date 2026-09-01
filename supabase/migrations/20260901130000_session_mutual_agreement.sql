-- Mutual session agreement: both parties propose and confirm before locking in.
-- Wealth project only (mmubhwyxszonhnpyeosy). Do not apply to the HR platform.

ALTER TABLE wealth.session_requests
  ADD COLUMN IF NOT EXISTS proposed_at timestamptz,
  ADD COLUMN IF NOT EXISTS proposed_by text,
  ADD COLUMN IF NOT EXISTS client_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS advisor_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'video';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'session_requests_proposed_by_check'
      AND conrelid = 'wealth.session_requests'::regclass
  ) THEN
    ALTER TABLE wealth.session_requests
      ADD CONSTRAINT session_requests_proposed_by_check
      CHECK (proposed_by IS NULL OR proposed_by IN ('client', 'advisor'));
  END IF;
END $$;

-- status was created as text; wm-queries casts to the enum on update.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'wealth'
      AND table_name = 'session_requests'
      AND column_name = 'status'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE wealth.session_requests ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE wealth.session_requests
      ALTER COLUMN status TYPE wealth.session_request_status
      USING status::wealth.session_request_status;
    ALTER TABLE wealth.session_requests
      ALTER COLUMN status SET DEFAULT 'pending'::wealth.session_request_status;
  END IF;
END $$;

DROP POLICY IF EXISTS session_requests_client_update ON wealth.session_requests;
CREATE POLICY session_requests_client_update ON wealth.session_requests
  FOR UPDATE TO authenticated
  USING (client_id = (SELECT wealth.current_client_id()))
  WITH CHECK (client_id = (SELECT wealth.current_client_id()));

GRANT SELECT, INSERT, UPDATE, DELETE ON wealth.session_requests TO authenticated;
GRANT ALL ON wealth.session_requests TO service_role;
