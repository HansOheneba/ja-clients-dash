-- Align John Doe with the JA Wealth reference report (June 2026).
-- Client: c0000000-0000-4000-8000-000000000001

-- Portfolio snapshots: growth + cash on account only, matching template totals.
UPDATE wealth.portfolio_snapshots SET
  previous_value_usd = 0,
  current_value_usd = 0,
  period_change_pct = NULL,
  ytd_pct = NULL,
  inception_gain_usd = NULL,
  inception_pct = NULL,
  annualized_return_pct = NULL
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND bucket IN ('income', 'venture', 'treasury');

UPDATE wealth.portfolio_snapshots SET
  previous_value_usd = 5000,
  current_value_usd = 5000,
  period_change_pct = NULL,
  ytd_pct = NULL,
  inception_gain_usd = NULL,
  inception_pct = NULL,
  annualized_return_pct = NULL
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND bucket = 'coa'
  AND period_id != 'b0000000-0000-4000-8000-000000000007';

-- Q1 2026: growth portfolio funded in February.
UPDATE wealth.portfolio_snapshots SET
  previous_value_usd = 0,
  current_value_usd = 245000,
  period_change_pct = NULL,
  ytd_pct = NULL,
  inception_gain_usd = 0,
  inception_pct = 0,
  annualized_return_pct = NULL
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND period_id = 'b0000000-0000-4000-8000-000000000006'
  AND bucket = 'growth';

-- Q2 2026 (latest): exact template figures.
UPDATE wealth.portfolio_snapshots SET
  previous_value_usd = 245000,
  current_value_usd = 280413,
  period_change_pct = 14.45,
  ytd_pct = 14.5,
  inception_gain_usd = 35413,
  inception_pct = 14.45,
  annualized_return_pct = 14.5
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND period_id = 'b0000000-0000-4000-8000-000000000007'
  AND bucket = 'growth';

UPDATE wealth.portfolio_snapshots SET
  previous_value_usd = 5000,
  current_value_usd = 5000,
  period_change_pct = NULL,
  ytd_pct = NULL,
  inception_gain_usd = NULL,
  inception_pct = NULL,
  annualized_return_pct = NULL
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND period_id = 'b0000000-0000-4000-8000-000000000007'
  AND bucket = 'coa';

UPDATE wealth.portfolio_snapshots SET
  previous_value_usd = 0,
  current_value_usd = 0,
  period_change_pct = NULL,
  ytd_pct = NULL,
  inception_gain_usd = NULL,
  inception_pct = NULL,
  annualized_return_pct = NULL
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND period_id = 'b0000000-0000-4000-8000-000000000007'
  AND bucket IN ('income', 'venture', 'treasury');

-- Zero growth on periods before Q1 2026.
UPDATE wealth.portfolio_snapshots SET
  previous_value_usd = 0,
  current_value_usd = 0,
  period_change_pct = NULL,
  ytd_pct = NULL,
  inception_gain_usd = NULL,
  inception_pct = NULL,
  annualized_return_pct = NULL
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND bucket = 'growth'
  AND period_id NOT IN (
    'b0000000-0000-4000-8000-000000000006',
    'b0000000-0000-4000-8000-000000000007'
  );

-- Portfolio history aligned with template statement dates.
DELETE FROM wealth.portfolio_history
WHERE client_id = 'c0000000-0000-4000-8000-000000000001';

INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd) VALUES
  ('c0000000-0000-4000-8000-000000000001', '2024-07-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2024-08-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2024-09-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2024-10-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2024-11-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2024-12-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-01-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-02-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-03-31', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-04-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-05-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-06-30', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-07-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-08-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-09-30', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-10-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-11-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2025-12-31', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2026-01-25', 5000),
  ('c0000000-0000-4000-8000-000000000001', '2026-02-25', 255000),
  ('c0000000-0000-4000-8000-000000000001', '2026-03-25', 250000),
  ('c0000000-0000-4000-8000-000000000001', '2026-04-25', 260000),
  ('c0000000-0000-4000-8000-000000000001', '2026-05-25', 272000),
  ('c0000000-0000-4000-8000-000000000001', '2026-06-25', 285413)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET
  total_value_usd = EXCLUDED.total_value_usd;

-- Template transaction: growth portfolio investment.
DELETE FROM wealth.transactions
WHERE client_id = 'c0000000-0000-4000-8000-000000000001';

INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'growth', '2026-02-24', 250000, 'Growth Portfolio Investment', 'deposit');
