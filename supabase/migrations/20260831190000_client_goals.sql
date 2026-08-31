-- Structured goals with target amounts and dates.
-- wealth.clients.financial_goals stays a short narrative on the profile.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'goal_status' AND n.nspname = 'wealth'
  ) THEN
    CREATE TYPE wealth.goal_status AS ENUM (
      'on-track',
      'at-risk',
      'ahead',
      'in-progress'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS wealth.client_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  icon_name text NOT NULL DEFAULT 'Landmark',
  target_usd numeric(18, 2) NOT NULL,
  current_usd numeric(18, 2) NOT NULL DEFAULT 0,
  target_date date,
  is_ongoing boolean NOT NULL DEFAULT false,
  probability_pct numeric(5, 2) NOT NULL DEFAULT 0,
  status wealth.goal_status NOT NULL DEFAULT 'in-progress',
  advisor_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_goals_name_present'
      AND conrelid = 'wealth.client_goals'::regclass
  ) THEN
    ALTER TABLE wealth.client_goals
      ADD CONSTRAINT client_goals_name_present CHECK (length(btrim(name)) > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_goals_amounts_nonneg'
      AND conrelid = 'wealth.client_goals'::regclass
  ) THEN
    ALTER TABLE wealth.client_goals
      ADD CONSTRAINT client_goals_amounts_nonneg
      CHECK (target_usd > 0 AND current_usd >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_goals_probability_range'
      AND conrelid = 'wealth.client_goals'::regclass
  ) THEN
    ALTER TABLE wealth.client_goals
      ADD CONSTRAINT client_goals_probability_range
      CHECK (probability_pct >= 0 AND probability_pct <= 100);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_goals_date_or_ongoing'
      AND conrelid = 'wealth.client_goals'::regclass
  ) THEN
    ALTER TABLE wealth.client_goals
      ADD CONSTRAINT client_goals_date_or_ongoing
      CHECK (
        (is_ongoing = true AND target_date IS NULL)
        OR (is_ongoing = false AND target_date IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wealth_client_goals_client
  ON wealth.client_goals (client_id, created_at DESC);

DROP TRIGGER IF EXISTS client_goals_updated_at ON wealth.client_goals;
CREATE TRIGGER client_goals_updated_at
  BEFORE UPDATE ON wealth.client_goals
  FOR EACH ROW EXECUTE FUNCTION wealth.set_updated_at();

ALTER TABLE wealth.client_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_goals_select ON wealth.client_goals;
CREATE POLICY client_goals_select ON wealth.client_goals
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
    OR EXISTS (
      SELECT 1 FROM wealth.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS client_goals_advisor_write ON wealth.client_goals;
CREATE POLICY client_goals_advisor_write ON wealth.client_goals
  FOR ALL TO authenticated
  USING (wealth.is_advisor())
  WITH CHECK (wealth.is_advisor());

GRANT SELECT, INSERT, UPDATE, DELETE ON wealth.client_goals
  TO authenticated, service_role;
GRANT ALL ON wealth.client_goals TO service_role;
REVOKE ALL ON wealth.client_goals FROM anon;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
