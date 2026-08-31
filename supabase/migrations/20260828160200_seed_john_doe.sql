-- Seed John Doe sample data. Platform advisor is tech@celerey.co only.
INSERT INTO wealth.advisors (id, full_name, email, is_admin, is_superadmin, is_active)
VALUES (
  'a0000000-0000-4000-8000-000000000002',
  'Celerey Platform',
  'tech@celerey.co',
  true,
  true,
  true
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_admin = true,
  is_superadmin = true,
  is_active = true;

INSERT INTO wealth.clients (
  id, client_number, reference_code, full_name, email, currency, inception_date, advisor_id
) VALUES (
  'c0000000-0000-4000-8000-000000000001',
  'CN000',
  'JAG000',
  'John Doe',
  'john.doe@example.com',
  'USD',
  '2018-01-01',
  'a0000000-0000-4000-8000-000000000002'
) ON CONFLICT (client_number) DO NOTHING;

INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
VALUES (
  'c0000000-0000-4000-8000-000000000001',
  'Beverly Hills Drive',
  'Beverly Hills',
  'CA',
  '90210',
  'US',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  '2024-09-25',
  '2024-12-25',
  'Q4 2024 (25 Sep - 25 Dec 2024)'
) ON CONFLICT (client_id, period_start, period_end) DO NOTHING;

INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES
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
  'Important Notice Regarding Valuations and Performance',
  'This document has been printed at the client''s request and shows the status of the client''s portfolio on the date indicated. The document has been provided in the format agreed with the client. This valuation does not show all portfolio features and does not contain details of recent transactions. The information provided may only be valid for a limited period and may be out of date at the time the valuation is generated and/or sent out. Only the formal valuation issued by the Group is binding. Positions are reflected according to the reference currency of the client. The portfolio valuations, as well as stock market and currency prices, apply for the time the valuation is printed. This valuation does not necessarily reflect the real market conditions under which new transactions might be executed, nor the conditions under which existing transactions might be closed out or liquidated. Portfolio valuations are based on prices or net asset values obtained from the Group''s usual sources of information, or in special cases information provided directly by the Client. Although prices and net asset values come from sources considered to be reliable, the Group does not guarantee or accept any responsibility for their accuracy. If a valuation is not given, this means that a price could not be determined. The prices shown are not tax value prices. Custodian banks, operations currently under way and any assets under pledge are not specifically indicated. Performance, and appreciation or depreciation in value, is shown purely for information purposes. Past performance should not be considered as a guarantee or indication of future results. This portfolio valuation is for information and is not signed. The Group does not provide any guarantee or accept any responsibility whatsoever as to its accuracy or completeness. Consequently, it expressly disclaims all responsibility for any loss or damage incurred as a result of its dissemination or use. The client is requested to check this portfolio valuation and in event of a disagreement, to notify the Group within one month from the date on which this document was communicated by the Group.',
  true
) ON CONFLICT (version) DO NOTHING;
