-- Mutual session agreement: both parties propose and confirm before locking in.

ALTER TABLE wealth.session_requests
  ADD COLUMN IF NOT EXISTS proposed_at timestamptz,
  ADD COLUMN IF NOT EXISTS proposed_by text CHECK (proposed_by IS NULL OR proposed_by IN ('client', 'advisor')),
  ADD COLUMN IF NOT EXISTS client_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS advisor_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'video';

DROP POLICY IF EXISTS session_requests_client_update ON wealth.session_requests;
CREATE POLICY session_requests_client_update ON wealth.session_requests
  FOR UPDATE TO authenticated
  USING (client_id = wealth.current_client_id())
  WITH CHECK (client_id = wealth.current_client_id());
