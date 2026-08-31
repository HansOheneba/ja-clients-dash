-- Wealth management schema (isolated from any other app data)
CREATE SCHEMA IF NOT EXISTS wealth;

CREATE TYPE wealth.user_role AS ENUM ('advisor', 'client', 'admin');
CREATE TYPE wealth.portfolio_bucket AS ENUM ('income', 'growth', 'venture', 'treasury', 'coa');
CREATE TYPE wealth.transaction_type AS ENUM ('drawdown', 'deposit', 'transfer', 'fee', 'other');
CREATE TYPE wealth.report_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE wealth.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wealth.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_number TEXT NOT NULL UNIQUE,
  reference_code TEXT NOT NULL DEFAULT 'JAG000',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',
  inception_date DATE,
  advisor_id UUID REFERENCES wealth.advisors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wealth.client_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  region TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  is_primary BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX client_addresses_primary_idx
  ON wealth.client_addresses (client_id)
  WHERE is_primary = true;

CREATE TABLE wealth.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role wealth.user_role NOT NULL DEFAULT 'client',
  client_id UUID REFERENCES wealth.clients(id) ON DELETE SET NULL,
  advisor_id UUID REFERENCES wealth.advisors(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wealth.statement_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, period_start, period_end)
);

CREATE TABLE wealth.portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES wealth.statement_periods(id) ON DELETE CASCADE,
  bucket wealth.portfolio_bucket NOT NULL,
  previous_value_usd NUMERIC(18, 2) NOT NULL DEFAULT 0,
  current_value_usd NUMERIC(18, 2) NOT NULL DEFAULT 0,
  period_change_pct NUMERIC(8, 4),
  ytd_pct NUMERIC(8, 4),
  inception_gain_usd NUMERIC(18, 2),
  inception_pct NUMERIC(8, 4),
  annualized_return_pct NUMERIC(8, 4),
  UNIQUE (client_id, period_id, bucket)
);

CREATE TABLE wealth.portfolio_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  recorded_on DATE NOT NULL,
  total_value_usd NUMERIC(18, 2) NOT NULL,
  UNIQUE (client_id, recorded_on)
);

CREATE TABLE wealth.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  bucket wealth.portfolio_bucket,
  occurred_on DATE NOT NULL,
  amount_usd NUMERIC(18, 2) NOT NULL,
  description TEXT NOT NULL,
  transaction_type wealth.transaction_type NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wealth.disclaimers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wealth.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES wealth.statement_periods(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  title TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  status wealth.report_status NOT NULL DEFAULT 'published',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (client_id, period_id, reference)
);

CREATE INDEX idx_wealth_clients_advisor ON wealth.clients(advisor_id);
CREATE INDEX idx_wealth_snapshots_client_period ON wealth.portfolio_snapshots(client_id, period_id);
CREATE INDEX idx_wealth_transactions_client_date ON wealth.transactions(client_id, occurred_on DESC);
CREATE INDEX idx_wealth_reports_client ON wealth.reports(client_id, generated_at DESC);
CREATE INDEX idx_wealth_history_client ON wealth.portfolio_history(client_id, recorded_on);

CREATE OR REPLACE FUNCTION wealth.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON wealth.clients
  FOR EACH ROW EXECUTE FUNCTION wealth.set_updated_at();

CREATE OR REPLACE FUNCTION wealth.current_client_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = wealth
AS $$
  SELECT client_id FROM wealth.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION wealth.current_advisor_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = wealth
AS $$
  SELECT advisor_id FROM wealth.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION wealth.is_advisor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = wealth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM wealth.profiles
    WHERE id = auth.uid() AND role IN ('advisor', 'admin')
  );
$$;

ALTER TABLE wealth.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.statement_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.portfolio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.disclaimers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON wealth.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY profiles_update_own ON wealth.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY advisors_select ON wealth.advisors
  FOR SELECT TO authenticated
  USING (wealth.is_advisor() OR auth_user_id = auth.uid());

CREATE POLICY clients_select ON wealth.clients
  FOR SELECT TO authenticated
  USING (
    id = wealth.current_client_id()
    OR advisor_id = wealth.current_advisor_id()
    OR EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY clients_advisor_write ON wealth.clients
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

CREATE POLICY client_addresses_select ON wealth.client_addresses
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
  );

CREATE POLICY client_addresses_advisor_write ON wealth.client_addresses
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

CREATE POLICY statement_periods_select ON wealth.statement_periods
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
  );

CREATE POLICY statement_periods_advisor_write ON wealth.statement_periods
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

CREATE POLICY portfolio_snapshots_select ON wealth.portfolio_snapshots
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
  );

CREATE POLICY portfolio_snapshots_advisor_write ON wealth.portfolio_snapshots
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

CREATE POLICY portfolio_history_select ON wealth.portfolio_history
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
  );

CREATE POLICY portfolio_history_advisor_write ON wealth.portfolio_history
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

CREATE POLICY transactions_select ON wealth.transactions
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
  );

CREATE POLICY transactions_advisor_write ON wealth.transactions
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

CREATE POLICY disclaimers_select ON wealth.disclaimers
  FOR SELECT TO authenticated
  USING (is_active = true OR wealth.is_advisor());

CREATE POLICY reports_select ON wealth.reports
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
  );

CREATE POLICY reports_advisor_write ON wealth.reports
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

GRANT USAGE ON SCHEMA wealth TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA wealth TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA wealth TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA wealth TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA wealth TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA wealth TO authenticated, service_role;

ALTER ROLE authenticator SET pgrst.db_schemas = 'public, wealth';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
