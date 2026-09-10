-- Position-level holdings for portfolio breakdown pages in wealth reports.
CREATE TABLE IF NOT EXISTS wealth.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wealth.clients(id) ON DELETE CASCADE,
  period_id UUID REFERENCES wealth.statement_periods(id) ON DELETE CASCADE,
  bucket wealth.portfolio_bucket NOT NULL,
  investment_name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  original_value_usd NUMERIC(18, 2) NOT NULL,
  market_value_usd NUMERIC(18, 2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_client_period
  ON wealth.portfolio_holdings (client_id, period_id, bucket, sort_order);

ALTER TABLE wealth.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY portfolio_holdings_select ON wealth.portfolio_holdings
  FOR SELECT TO authenticated
  USING (
    client_id = wealth.current_client_id()
    OR EXISTS (
      SELECT 1 FROM wealth.clients c
      WHERE c.id = client_id AND c.advisor_id = wealth.current_advisor_id()
    )
    OR wealth.is_advisor()
  );

CREATE POLICY portfolio_holdings_advisor_write ON wealth.portfolio_holdings
  FOR ALL TO authenticated
  USING (wealth.is_advisor()) WITH CHECK (wealth.is_advisor());

-- John Doe: growth portfolio holdings from the JA Wealth reference report.
INSERT INTO wealth.portfolio_holdings (
  client_id, period_id, bucket, investment_name, ticker, original_value_usd, market_value_usd, sort_order
) VALUES
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Celsius Holdings Inc.', 'CELH', 8750, 6942, 1),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Decalia Aegis Defense', 'LU3269411313', 18750, 17665, 2),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Invesco Nasdaq 100', 'QQQM', 43750, 54553, 3),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'iShares Russell 2000 ETF', 'IWM', 25000, 30190, 4),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'iShares S&P 400 Mid Cap', 'IJJ', 12500, 13968, 5),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Palantir Technologies Inc.', 'PLTR', 10000, 7294, 6),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'VanEck Real Assets ETF', 'RAAX', 12500, 12596, 7),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'VanEck Semiconductor ETF', 'SMH', 18750, 31207, 8),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard Developed Europe', 'VWCG', 18750, 20738, 9),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard Developed World', 'VHVE', 13750, 15694, 10),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard FTSE Emerg Mkts', 'VFEA', 25000, 27558, 11),
  ('c0000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard S&P 500', 'VUAA', 37500, 42008, 12);
