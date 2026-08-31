-- Wealth manager profile and client session requests.

ALTER TABLE wealth.advisors
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS availability_notes TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

UPDATE wealth.advisors
SET title = 'Wealth Manager'
WHERE title IS NULL OR trim(title) = '';

UPDATE wealth.advisors
SET onboarding_completed_at = COALESCE(onboarding_completed_at, now())
WHERE is_active = true;

CREATE TABLE IF NOT EXISTS wealth.session_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES wealth.advisors(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  preferred_times TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_requests_advisor_idx
  ON wealth.session_requests (advisor_id, created_at DESC);

ALTER TABLE wealth.session_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS session_requests_client_insert ON wealth.session_requests;
CREATE POLICY session_requests_client_insert ON wealth.session_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id = wealth.current_client_id()
    AND advisor_id = (SELECT advisor_id FROM wealth.clients WHERE id = client_id)
  );

DROP POLICY IF EXISTS session_requests_select ON wealth.session_requests;
CREATE POLICY session_requests_select ON wealth.session_requests
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR advisor_id = wealth.current_advisor_id()
    OR EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin')
  );
