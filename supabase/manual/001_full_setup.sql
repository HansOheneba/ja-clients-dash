-- =============================================================================
-- JA Clients Portal | Manual setup for project: mmubhwyxszonhnpyeosy
-- Run in Supabase Dashboard → SQL Editor (JA-Clients-Portal project only)
-- Run each section in order. Safe to re-run sections marked [idempotent].
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: Schema, tables, RLS [idempotent where noted]
-- -----------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS wealth;

DO $$ BEGIN
  CREATE TYPE wealth.user_role AS ENUM ('advisor', 'client', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wealth.portfolio_bucket AS ENUM ('income', 'growth', 'venture', 'treasury', 'coa');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wealth.transaction_type AS ENUM ('drawdown', 'deposit', 'transfer', 'fee', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wealth.report_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS wealth.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  title TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wealth.advisors
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS wealth.clients (
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

CREATE TABLE IF NOT EXISTS wealth.client_addresses (
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

CREATE UNIQUE INDEX IF NOT EXISTS client_addresses_primary_idx
  ON wealth.client_addresses (client_id) WHERE is_primary = true;

CREATE TABLE IF NOT EXISTS wealth.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role wealth.user_role NOT NULL DEFAULT 'client',
  client_id UUID REFERENCES wealth.clients(id) ON DELETE SET NULL,
  advisor_id UUID REFERENCES wealth.advisors(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wealth.statement_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS wealth.portfolio_snapshots (
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

CREATE TABLE IF NOT EXISTS wealth.portfolio_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  recorded_on DATE NOT NULL,
  total_value_usd NUMERIC(18, 2) NOT NULL,
  UNIQUE (client_id, recorded_on)
);

CREATE TABLE IF NOT EXISTS wealth.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  bucket wealth.portfolio_bucket,
  occurred_on DATE NOT NULL,
  amount_usd NUMERIC(18, 2) NOT NULL,
  description TEXT NOT NULL,
  transaction_type wealth.transaction_type NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wealth.disclaimers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wealth.reports (
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

CREATE INDEX IF NOT EXISTS idx_wealth_clients_advisor ON wealth.clients(advisor_id);
CREATE INDEX IF NOT EXISTS idx_wealth_snapshots_client_period ON wealth.portfolio_snapshots(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_wealth_transactions_client_date ON wealth.transactions(client_id, occurred_on DESC);
CREATE INDEX IF NOT EXISTS idx_wealth_reports_client ON wealth.reports(client_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_wealth_history_client ON wealth.portfolio_history(client_id, recorded_on);

CREATE OR REPLACE FUNCTION wealth.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON wealth.clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON wealth.clients
  FOR EACH ROW EXECUTE FUNCTION wealth.set_updated_at();

CREATE OR REPLACE FUNCTION wealth.current_client_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = wealth AS $$
  SELECT client_id FROM wealth.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION wealth.current_advisor_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = wealth AS $$
  SELECT advisor_id FROM wealth.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION wealth.is_advisor()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = wealth AS $$
  SELECT EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role IN ('advisor', 'admin'));
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

-- Policies (drop + recreate so re-runs work)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'wealth'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON wealth.%I', r.policyname, r.tablename); END LOOP;
END $$;

CREATE POLICY profiles_select_own ON wealth.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_update_own ON wealth.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY advisors_select ON wealth.advisors FOR SELECT TO authenticated USING (wealth.is_advisor() OR auth_user_id = auth.uid());

DROP POLICY IF EXISTS advisors_admin_write ON wealth.advisors;
CREATE POLICY advisors_admin_write ON wealth.advisors
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wealth.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wealth.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );
CREATE POLICY clients_select ON wealth.clients FOR SELECT TO authenticated USING (id = wealth.current_client_id() OR advisor_id = wealth.current_advisor_id() OR EXISTS (SELECT 1 FROM wealth.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY clients_advisor_write ON wealth.clients FOR ALL TO authenticated USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());
CREATE POLICY client_addresses_select ON wealth.client_addresses FOR SELECT TO authenticated USING (client_id = wealth.current_client_id() OR EXISTS (SELECT 1 FROM wealth.clients c WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()));
CREATE POLICY client_addresses_advisor_write ON wealth.client_addresses FOR ALL TO authenticated USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());
CREATE POLICY statement_periods_select ON wealth.statement_periods FOR SELECT TO authenticated USING (client_id = wealth.current_client_id() OR EXISTS (SELECT 1 FROM wealth.clients c WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()));
CREATE POLICY statement_periods_advisor_write ON wealth.statement_periods FOR ALL TO authenticated USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());
CREATE POLICY portfolio_snapshots_select ON wealth.portfolio_snapshots FOR SELECT TO authenticated USING (client_id = wealth.current_client_id() OR EXISTS (SELECT 1 FROM wealth.clients c WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()));
CREATE POLICY portfolio_snapshots_advisor_write ON wealth.portfolio_snapshots FOR ALL TO authenticated USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());
CREATE POLICY portfolio_history_select ON wealth.portfolio_history FOR SELECT TO authenticated USING (client_id = wealth.current_client_id() OR EXISTS (SELECT 1 FROM wealth.clients c WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()));
CREATE POLICY portfolio_history_advisor_write ON wealth.portfolio_history FOR ALL TO authenticated USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());
CREATE POLICY transactions_select ON wealth.transactions FOR SELECT TO authenticated USING (client_id = wealth.current_client_id() OR EXISTS (SELECT 1 FROM wealth.clients c WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()));
CREATE POLICY transactions_advisor_write ON wealth.transactions FOR ALL TO authenticated USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());
CREATE POLICY disclaimers_select ON wealth.disclaimers FOR SELECT TO authenticated USING (is_active = true OR wealth.is_advisor());
CREATE POLICY reports_select ON wealth.reports FOR SELECT TO authenticated USING (client_id = wealth.current_client_id() OR EXISTS (SELECT 1 FROM wealth.clients c WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()));
CREATE POLICY reports_advisor_write ON wealth.reports FOR ALL TO authenticated USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

GRANT USAGE ON SCHEMA wealth TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA wealth TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA wealth TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA wealth TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA wealth TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA wealth TO authenticated, service_role;

ALTER ROLE authenticator SET pgrst.db_schemas = 'public, wealth';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- -----------------------------------------------------------------------------
-- SECTION 2: Storage bucket for PDF reports
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reports', 'reports', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS reports_storage_advisor_insert ON storage.objects;
DROP POLICY IF EXISTS reports_storage_advisor_update ON storage.objects;
DROP POLICY IF EXISTS reports_storage_select ON storage.objects;

CREATE POLICY reports_storage_advisor_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports' AND wealth.is_advisor());

CREATE POLICY reports_storage_advisor_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'reports' AND wealth.is_advisor())
  WITH CHECK (bucket_id = 'reports' AND wealth.is_advisor());

CREATE POLICY reports_storage_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'reports' AND (wealth.is_advisor() OR (storage.foldername(name))[1] = wealth.current_client_id()::text));

-- App-managed login OTP codes (sent via Resend)
CREATE TABLE IF NOT EXISTS wealth.login_otps (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumed_at TIMESTAMPTZ
);

ALTER TABLE wealth.login_otps ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS login_otps_expires_at_idx ON wealth.login_otps (expires_at);

-- -----------------------------------------------------------------------------
-- SECTION 3: Seed John Doe sample client
-- -----------------------------------------------------------------------------

INSERT INTO wealth.advisors (id, full_name, email, is_admin, is_superadmin, is_active)
VALUES ('a0000000-0000-4000-8000-000000000002', 'Celerey Platform', 'tech@celerey.co', true, true, true)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_admin = true,
  is_superadmin = true,
  is_active = true;

UPDATE wealth.profiles AS p
   SET role = 'admin'
  FROM wealth.advisors AS a
 WHERE p.advisor_id = a.id
   AND a.is_admin = true
   AND a.is_active = true
   AND p.role <> 'admin';

INSERT INTO wealth.clients (id, client_number, reference_code, full_name, email, currency, inception_date, advisor_id)
VALUES ('c0000000-0000-4000-8000-000000000001', 'CN000', 'JAG000', 'John Doe', 'john.doe@example.com', 'USD', '2018-01-01', 'a0000000-0000-4000-8000-000000000002')
ON CONFLICT (client_number) DO UPDATE SET advisor_id = EXCLUDED.advisor_id;

INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
SELECT 'c0000000-0000-4000-8000-000000000001', 'Beverly Hills Drive', 'Beverly Hills', 'CA', '90210', 'US', true
WHERE NOT EXISTS (SELECT 1 FROM wealth.client_addresses WHERE client_id = 'c0000000-0000-4000-8000-000000000001' AND is_primary = true);

INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', '2024-09-25', '2024-12-25', 'Q4 2024 (25 Sep - 25 Dec 2024)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;

INSERT INTO wealth.portfolio_snapshots (client_id, period_id, bucket, previous_value_usd, current_value_usd, period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'income',  500000, 550000,  2.0,  2.0, 395838, 83.0, 8.0),
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'growth',  300000, 330000,  8.0,  8.0,  30000, 10.0, 8.0),
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'venture', 1200000, 1300000, 4.2,  4.2,  50000,  4.0, 8.0),
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'treasury', 0, 0, NULL, NULL, 100000, 12.0, 8.0),
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'coa', 401521, 401521, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (client_id, period_id, bucket) DO NOTHING;

INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd) VALUES
  ('c0000000-0000-4000-8000-000000000001', '2024-07-25', 2200000),
  ('c0000000-0000-4000-8000-000000000001', '2024-08-25', 2280000),
  ('c0000000-0000-4000-8000-000000000001', '2024-09-25', 2401521),
  ('c0000000-0000-4000-8000-000000000001', '2024-10-25', 2480000),
  ('c0000000-0000-4000-8000-000000000001', '2024-11-25', 2550000),
  ('c0000000-0000-4000-8000-000000000001', '2024-12-25', 2581521)
ON CONFLICT (client_id, recorded_on) DO NOTHING;

INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'income', '2024-12-25', 20000, 'Income Portfolio Drawdown', 'drawdown'),
  ('c0000000-0000-4000-8000-000000000001', 'income', '2025-09-08', 10000, 'Income Portfolio Drawdown', 'drawdown'),
  ('c0000000-0000-4000-8000-000000000001', 'income', '2025-09-09', 25000, 'Income Portfolio Drawdown', 'drawdown'),
  ('c0000000-0000-4000-8000-000000000001', 'income', '2025-10-12',  6000, 'Income Portfolio Drawdown', 'drawdown'),
  ('c0000000-0000-4000-8000-000000000001', 'income', '2025-10-17', 10000, 'Income Portfolio Drawdown', 'drawdown'),
  ('c0000000-0000-4000-8000-000000000001', 'income', '2025-11-19',  4000, 'Income Portfolio Drawdown', 'drawdown'),
  ('c0000000-0000-4000-8000-000000000001', 'income', '2025-12-28', 30000, 'Income Portfolio Drawdown', 'drawdown');

INSERT INTO wealth.disclaimers (version, title, body, is_active) VALUES (
  'v1',
  'Important Notice Regarding Valuations & Performance',
  'This document has been printed at the client''s request and shows the status of the client''s portfolio on the date indicated. The document has been provided in the format agreed with the client. This valuation does not show all portfolio features and does not contain details of recent transactions. The information provided may only be valid for a limited period and may be out of date at the time the valuation is generated and/or sent out. Only the formal valuation issued by the Group is binding. Positions are reflected according to the reference currency of the client. The portfolio valuations, as well as stock market and currency prices, apply for the time the valuation is printed. This valuation does not necessarily reflect the real market conditions under which new transactions might be executed, nor the conditions under which existing transactions might be closed out or liquidated. Portfolio valuations are based on prices or net asset values obtained from the Group''s usual sources of information, or in special cases information provided directly by the Client. Although prices and net asset values come from sources considered to be reliable, the Group does not guarantee or accept any responsibility for their accuracy. If a valuation is not given, this means that a price could not be determined. The prices shown are not tax value prices. Custodian banks, operations currently under way and any assets under pledge are not specifically indicated. Performance, and appreciation or depreciation in value, is shown purely for information purposes. Past performance should not be considered as a guarantee or indication of future results. This portfolio valuation is for information and is not signed. The Group does not provide any guarantee or accept any responsibility whatsoever as to its accuracy or completeness. Consequently, it expressly disclaims all responsibility for any loss or damage incurred as a result of its dissemination or use. The client is requested to check this portfolio valuation and in event of a disagreement, to notify the Group within one month from the date on which this document was communicated by the Group.',
  true
) ON CONFLICT (version) DO NOTHING;

UPDATE wealth.disclaimers
   SET title = 'Important Notice Regarding Valuations & Performance'
 WHERE is_active = true;

-- Verify
SELECT 'wealth.clients' AS check, count(*) FROM wealth.clients
UNION ALL SELECT 'wealth.portfolio_snapshots', count(*) FROM wealth.portfolio_snapshots;
