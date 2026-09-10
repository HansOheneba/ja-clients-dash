-- Wealth schema only. Do not modify HR platform tables or other schemas.
-- Seed diverse demo clients with full portfolio, goals, and activity data.
-- Advisor: Celerey Platform (tech@celerey.co)

-- Lois Lane
INSERT INTO wealth.clients (
  id, client_number, reference_code, full_name, email, phone, currency, inception_date,
  advisor_id, status, risk_profile, investment_horizon, primary_objective,
  marital_status, dependents, estate_status, financial_goals, advisor_notes,
  date_of_birth, review_cadence, next_review_date, last_contact_date, risk_assessed_at
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'JA-2EAAAAAA', 'JA-2EAAAAAA', 'Lois Lane', 'lois.lane@email.com', '+44 7700 900123',
  'USD', '2021-03-15', 'a0000000-0000-4000-8000-000000000002',
  'active'::wealth.client_status,
  'Balanced', '15+ years', 'Legacy and succession planning',
  'Married', 2, 'Estate plan review in progress',
  'Succession planning for family estate and long-term wealth preservation across generations.', 'Lois is focused on long-term legacy planning and succession for her estate. Prefers email communication. Has expressed interest in increasing digital assets exposure subject to risk review.',
  '1975-08-12',
  'quarterly'::wealth.review_cadence,
  '2026-09-30'::date,
  '2026-06-12'::date,
  CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  advisor_notes = EXCLUDED.advisor_notes;
INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
VALUES ('c1000000-0000-4000-8000-000000000001', '14 Cadogan Square', 'London', 'Greater London', 'SW1X 0JP', 'GB', true)
ON CONFLICT DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', '2024-09-25', '2024-12-25', 'Q4 2024 (25 Sep - 25 Dec 2024)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', '2025-01-01', '2025-03-31', 'Q1 2025 (1 Jan - 31 Mar 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', '2025-04-01', '2025-06-30', 'Q2 2025 (1 Apr - 30 Jun 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', '2025-07-01', '2025-09-30', 'Q3 2025 (1 Jul - 30 Sep 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000001', '2025-10-01', '2025-12-31', 'Q4 2025 (1 Oct - 31 Dec 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', '2026-01-01', '2026-03-31', 'Q1 2026 (1 Jan - 31 Mar 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000001', '2026-04-01', '2026-06-30', 'Q2 2026 (1 Apr - 30 Jun 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'income',
  699973, 699973,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'growth',
  1035997, 1035997,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'venture',
  447132, 447132,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'treasury',
  308521, 308521,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'coa',
  308378, 308378,
  0, 2,
  0, 0, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'income',
  699973, 721594,
  3.1, 3.2,
  21621, 3.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'growth',
  1035997, 1067998,
  3.1, 3.2,
  32001, 3.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'venture',
  447132, 460943,
  3.1, 3.2,
  13811, 3.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'treasury',
  308521, 318051,
  3.1, 3.2,
  9530, 3.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'coa',
  308378, 317903,
  3.1, 3.2,
  9525, 3.1, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'income',
  721594, 743215,
  3, 4.4,
  43242, 6.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'growth',
  1067998, 1099998,
  3, 4.4,
  64001, 6.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'venture',
  460943, 474755,
  3, 4.4,
  27623, 6.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'treasury',
  318051, 327581,
  3, 4.4,
  19060, 6.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'coa',
  317903, 327429,
  3, 4.4,
  19051, 6.2, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000004', 'income',
  743215, 764837,
  2.9, 5.6,
  64864, 9.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000004', 'growth',
  1099998, 1131999,
  2.9, 5.6,
  96002, 9.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000004', 'venture',
  474755, 488566,
  2.9, 5.6,
  41434, 9.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000004', 'treasury',
  327581, 337111,
  2.9, 5.6,
  28590, 9.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000004', 'coa',
  327429, 336954,
  2.9, 5.6,
  28576, 9.3, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000005', 'income',
  764837, 786458,
  2.8, 6.8,
  86485, 12.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000005', 'growth',
  1131999, 1163999,
  2.8, 6.8,
  128002, 12.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000005', 'venture',
  488566, 502377,
  2.8, 6.8,
  55245, 12.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000005', 'treasury',
  337111, 346640,
  2.8, 6.8,
  38119, 12.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000005', 'coa',
  336954, 346479,
  2.8, 6.8,
  38101, 12.4, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', 'income',
  786458, 808079,
  2.7, 8,
  108106, 15.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', 'growth',
  1163999, 1196000,
  2.7, 8,
  160003, 15.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', 'venture',
  502377, 516189,
  2.7, 8,
  69057, 15.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', 'treasury',
  346640, 356170,
  2.7, 8,
  47649, 15.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', 'coa',
  346479, 356005,
  2.7, 8,
  47627, 15.4, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000007', 'income',
  808079, 829700,
  2.7, 9.2,
  129727, 18.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000007', 'growth',
  1196000, 1228000,
  2.7, 9.2,
  192003, 18.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000007', 'venture',
  516189, 530000,
  2.7, 9.2,
  82868, 18.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000007', 'treasury',
  356170, 365700,
  2.7, 9.2,
  57179, 18.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000007', 'coa',
  356005, 365530,
  2.7, 9.2,
  57152, 18.5, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2024-07-25', 2820000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2024-08-25', 2890000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2024-09-25', 2950000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2024-10-25', 3010000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2024-11-25', 2980000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2024-12-25', 3050000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2025-01-25', 3100000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2025-02-25', 3160000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2025-03-31', 3200000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2025-04-25', 3240000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2025-05-25', 3290000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c1000000-0000-4000-8000-000000000001', '2025-06-30', 3318930)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c1000000-0000-4000-8000-000000000001', 'income', '2026-05-18', 12000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c1000000-0000-4000-8000-000000000001', 'income', '2026-02-14', 9000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c1000000-0000-4000-8000-000000000001', 'income', '2025-11-22', 11000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Generational Legacy Trust',
  'Wealth Preservation', 'HeartHandshake', 5000000, 3318930,
  NULL, true,
  72, 'in-progress'::wealth.goal_status,
  'Trust structure under review. Beneficiary designations need updating before Q3 estate session.',
  'growth'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Succession planning reserve',
  'Wealth Preservation', 'Landmark', 1500000, 980000,
  '2028-06-01'::date, false,
  78, 'on-track'::wealth.goal_status,
  'Ring-fenced liquidity for succession costs. On track with quarterly contributions.',
  'income'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'University fees for James',
  'Children''s Education', 'GraduationCap', 320000, 145000,
  '2032-09-01'::date, false,
  65, 'at-risk'::wealth.goal_status,
  'Tuition inflation is outpacing savings rate. Consider increasing monthly education contributions.',
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c1000000-0000-4000-8000-000000000001', 'general'::wealth.update_kind, 'Succession planning review requested',
  'Lois requested a dedicated succession planning session with the estate team.', now() - interval '20 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c1000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Quarterly portfolio review completed',
  'Q2 2026 portfolio review completed. Allocation remains aligned with long-term objectives.', now() - interval '29 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c1000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Trust deed amendment uploaded',
  'Updated trust deed amendment filed to the vault.', now() - interval '38 days');
INSERT INTO wealth.client_advisor_notes (client_id, author_advisor_id, body)
SELECT 'c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Lois is focused on long-term legacy planning and succession for her estate. Prefers email communication. Has expressed interest in increasing digital assets exposure subject to risk review.'
WHERE NOT EXISTS (
  SELECT 1 FROM wealth.client_advisor_notes n WHERE n.client_id = 'c1000000-0000-4000-8000-000000000001'
);
INSERT INTO wealth.message_threads (client_id, advisor_id)
SELECT 'c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM wealth.message_threads t WHERE t.client_id = 'c1000000-0000-4000-8000-000000000001');

-- Marcus Webb
INSERT INTO wealth.clients (
  id, client_number, reference_code, full_name, email, phone, currency, inception_date,
  advisor_id, status, risk_profile, investment_horizon, primary_objective,
  marital_status, dependents, estate_status, financial_goals, advisor_notes,
  date_of_birth, review_cadence, next_review_date, last_contact_date, risk_assessed_at
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'JA-2JAAAAAA', 'JA-2JAAAAAA', 'Marcus Webb', 'm.webb@webbgroup.com', '+44 7700 900456',
  'USD', '2019-01-10', 'a0000000-0000-4000-8000-000000000002',
  'active'::wealth.client_status,
  'Moderate', '20+ years', 'Capital preservation with property growth',
  'Married', 3, 'Succession plan finalised',
  'Consolidate fixed income, grow UK real estate holdings, and maintain family succession structure.', 'Marcus is one of our longest-standing clients. Very hands-on with property acquisitions. Prefers in-person meetings and monthly status calls. Looking to consolidate his fixed income position.',
  '1968-04-03',
  'semi_annual'::wealth.review_cadence,
  '2026-12-31'::date,
  '2026-06-14'::date,
  CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  advisor_notes = EXCLUDED.advisor_notes;
INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
VALUES ('c2000000-0000-4000-8000-000000000001', '88 Deansgate', 'Manchester', 'Greater Manchester', 'M3 2ER', 'GB', true)
ON CONFLICT DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b2000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', '2024-09-25', '2024-12-25', 'Q4 2024 (25 Sep - 25 Dec 2024)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b2000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000001', '2025-01-01', '2025-03-31', 'Q1 2025 (1 Jan - 31 Mar 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b2000000-0000-4000-8000-000000000003', 'c2000000-0000-4000-8000-000000000001', '2025-04-01', '2025-06-30', 'Q2 2025 (1 Apr - 30 Jun 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b2000000-0000-4000-8000-000000000004', 'c2000000-0000-4000-8000-000000000001', '2025-07-01', '2025-09-30', 'Q3 2025 (1 Jul - 30 Sep 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b2000000-0000-4000-8000-000000000005', 'c2000000-0000-4000-8000-000000000001', '2025-10-01', '2025-12-31', 'Q4 2025 (1 Oct - 31 Dec 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b2000000-0000-4000-8000-000000000006', 'c2000000-0000-4000-8000-000000000001', '2026-01-01', '2026-03-31', 'Q1 2026 (1 Jan - 31 Mar 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b2000000-0000-4000-8000-000000000007', 'c2000000-0000-4000-8000-000000000001', '2026-04-01', '2026-06-30', 'Q2 2026 (1 Apr - 30 Jun 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'income',
  1980295, 1980295,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'growth',
  2417941, 2417941,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'venture',
  0, 0,
  NULL, 2,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'treasury',
  1177666, 1177666,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'coa',
  624098, 624098,
  0, 2,
  0, 0, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 'income',
  1980295, 2083579,
  5.2, 3.2,
  103284, 5.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 'growth',
  2417941, 2544051,
  5.2, 3.2,
  126110, 5.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 'venture',
  0, 0,
  NULL, 3.2,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 'treasury',
  1177666, 1239088,
  5.2, 3.2,
  61422, 5.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 'coa',
  624098, 656648,
  5.2, 3.2,
  32550, 5.2, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', 'income',
  2083579, 2186863,
  5, 4.4,
  206568, 10.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', 'growth',
  2544051, 2670161,
  5, 4.4,
  252220, 10.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', 'venture',
  0, 0,
  NULL, 4.4,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', 'treasury',
  1239088, 1300511,
  5, 4.4,
  122845, 10.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', 'coa',
  656648, 689199,
  5, 4.4,
  65101, 10.4, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'income',
  2186863, 2290148,
  4.7, 5.6,
  309853, 15.6, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'growth',
  2670161, 2796271,
  4.7, 5.6,
  378330, 15.6, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'venture',
  0, 0,
  NULL, 5.6,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'treasury',
  1300511, 1361933,
  4.7, 5.6,
  184267, 15.6, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'coa',
  689199, 721749,
  4.7, 5.6,
  97651, 15.6, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', 'income',
  2290148, 2393432,
  4.5, 6.8,
  413137, 20.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', 'growth',
  2796271, 2922380,
  4.5, 6.8,
  504439, 20.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', 'venture',
  0, 0,
  NULL, 6.8,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', 'treasury',
  1361933, 1423355,
  4.5, 6.8,
  245689, 20.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', 'coa',
  721749, 754299,
  4.5, 6.8,
  130201, 20.9, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000006', 'income',
  2393432, 2496716,
  4.3, 8,
  516421, 26.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000006', 'growth',
  2922380, 3048490,
  4.3, 8,
  630549, 26.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000006', 'venture',
  0, 0,
  NULL, 8,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000006', 'treasury',
  1423355, 1484778,
  4.3, 8,
  307112, 26.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000006', 'coa',
  754299, 786850,
  4.3, 8,
  162752, 26.1, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000007', 'income',
  2496716, 2600000,
  4.1, 9.2,
  619705, 31.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000007', 'growth',
  3048490, 3174600,
  4.1, 9.2,
  756659, 31.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000007', 'venture',
  0, 0,
  NULL, 9.2,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000007', 'treasury',
  1484778, 1546200,
  4.1, 9.2,
  368534, 31.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000007', 'coa',
  786850, 819400,
  4.1, 9.2,
  195302, 31.3, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2024-07-25', 6200000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2024-08-25', 6410000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2024-09-25', 6580000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2024-10-25', 6720000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2024-11-25', 6850000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2024-12-25', 7000000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2025-01-25', 7150000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2025-02-25', 7380000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2025-03-31', 7520000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2025-04-25', 7740000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2025-05-25', 7940000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c2000000-0000-4000-8000-000000000001', '2025-06-30', 8140200)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c2000000-0000-4000-8000-000000000001', 'income', '2026-04-10', 25000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c2000000-0000-4000-8000-000000000001', 'income', '2026-01-20', 18000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c2000000-0000-4000-8000-000000000001', 'treasury', '2025-10-05', 450000, 'Property acquisition deposit', 'transfer'::wealth.transaction_type);
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd2000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'UK property portfolio expansion',
  'Property Purchase', 'Building2', 10000000, 8140200,
  '2029-12-01'::date, false,
  81, 'on-track'::wealth.goal_status,
  'Two commercial acquisitions in diligence. Fixed income consolidation will free capital for deposits.',
  'treasury'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd2000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000001', 'Family succession structure',
  'Wealth Preservation', 'HeartHandshake', 8000000, 8140200,
  NULL, true,
  94, 'ahead'::wealth.goal_status,
  'Succession plan signed and trusts established. Annual review only.',
  'growth'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd2000000-0000-4000-8000-000000000003', 'c2000000-0000-4000-8000-000000000001', 'Fixed income consolidation',
  'Wealth Preservation', 'Landmark', 3000000, 2600000,
  '2027-03-01'::date, false,
  76, 'in-progress'::wealth.goal_status,
  'Consolidating legacy bond positions into managed income portfolio.',
  'income'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c2000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Q1 2026 statement uploaded',
  'Quarterly statement data ingested for Q1 2026.', now() - interval '22 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c2000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Annual review completed',
  '2026 mid-year review completed. All succession targets met.', now() - interval '65 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c2000000-0000-4000-8000-000000000001', 'note'::wealth.update_kind, 'Real estate acquisition briefing',
  'Briefing held on Manchester commercial property opportunity.', now() - interval '108 days');
INSERT INTO wealth.client_advisor_notes (client_id, author_advisor_id, body)
SELECT 'c2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Marcus is one of our longest-standing clients. Very hands-on with property acquisitions. Prefers in-person meetings and monthly status calls. Looking to consolidate his fixed income position.'
WHERE NOT EXISTS (
  SELECT 1 FROM wealth.client_advisor_notes n WHERE n.client_id = 'c2000000-0000-4000-8000-000000000001'
);
INSERT INTO wealth.message_threads (client_id, advisor_id)
SELECT 'c2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM wealth.message_threads t WHERE t.client_id = 'c2000000-0000-4000-8000-000000000001');

-- Priya Nair
INSERT INTO wealth.clients (
  id, client_number, reference_code, full_name, email, phone, currency, inception_date,
  advisor_id, status, risk_profile, investment_horizon, primary_objective,
  marital_status, dependents, estate_status, financial_goals, advisor_notes,
  date_of_birth, review_cadence, next_review_date, last_contact_date, risk_assessed_at
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'JA-2NAAAAAA', 'JA-2NAAAAAA', 'Priya Nair', 'priya.nair@nairventures.co.uk', '+44 7700 900789',
  'USD', '2022-09-01', 'a0000000-0000-4000-8000-000000000002',
  'active'::wealth.client_status,
  'Growth-oriented', '12+ years', 'Digital assets growth with family trust setup',
  'Married', 1, 'Will review complete, trust structure pending',
  'Establish family trust, grow digital assets allocation, and fund daughter education.', 'Priya has a strong appetite for digital assets and has doubled her allocation this year. Key focus now is setting up a family trust. Prefers brief written updates over calls.',
  '1982-11-28',
  'quarterly'::wealth.review_cadence,
  '2026-09-30'::date,
  '2026-06-01'::date,
  CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  advisor_notes = EXCLUDED.advisor_notes;
INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
VALUES ('c3000000-0000-4000-8000-000000000001', '22 Colmore Row', 'Birmingham', 'West Midlands', 'B3 2QD', 'GB', true)
ON CONFLICT DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b3000000-0000-4000-8000-000000000001', 'c3000000-0000-4000-8000-000000000001', '2024-09-25', '2024-12-25', 'Q4 2024 (25 Sep - 25 Dec 2024)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b3000000-0000-4000-8000-000000000002', 'c3000000-0000-4000-8000-000000000001', '2025-01-01', '2025-03-31', 'Q1 2025 (1 Jan - 31 Mar 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b3000000-0000-4000-8000-000000000003', 'c3000000-0000-4000-8000-000000000001', '2025-04-01', '2025-06-30', 'Q2 2025 (1 Apr - 30 Jun 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b3000000-0000-4000-8000-000000000004', 'c3000000-0000-4000-8000-000000000001', '2025-07-01', '2025-09-30', 'Q3 2025 (1 Jul - 30 Sep 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b3000000-0000-4000-8000-000000000005', 'c3000000-0000-4000-8000-000000000001', '2025-10-01', '2025-12-31', 'Q4 2025 (1 Oct - 31 Dec 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b3000000-0000-4000-8000-000000000006', 'c3000000-0000-4000-8000-000000000001', '2026-01-01', '2026-03-31', 'Q1 2026 (1 Jan - 31 Mar 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b3000000-0000-4000-8000-000000000007', 'c3000000-0000-4000-8000-000000000001', '2026-04-01', '2026-06-30', 'Q2 2026 (1 Apr - 30 Jun 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'income',
  1100233, 1100233,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'growth',
  1937751, 1937751,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'venture',
  1362016, 1362016,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'treasury',
  0, 0,
  NULL, 2,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'coa',
  0, 0,
  NULL, NULL,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000002', 'income',
  1100233, 1113694,
  1.2, 3.2,
  13461, 1.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000002', 'growth',
  1937751, 1961459,
  1.2, 3.2,
  23708, 1.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000002', 'venture',
  1362016, 1378680,
  1.2, 3.2,
  16664, 1.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000002', 'treasury',
  0, 0,
  NULL, 3.2,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000002', 'coa',
  0, 0,
  NULL, NULL,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000003', 'income',
  1113694, 1127155,
  1.2, 4.4,
  26922, 2.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000003', 'growth',
  1961459, 1985167,
  1.2, 4.4,
  47416, 2.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000003', 'venture',
  1378680, 1395344,
  1.2, 4.4,
  33328, 2.4, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000003', 'treasury',
  0, 0,
  NULL, 4.4,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000003', 'coa',
  0, 0,
  NULL, NULL,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000004', 'income',
  1127155, 1140617,
  1.2, 5.6,
  40384, 3.7, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000004', 'growth',
  1985167, 2008876,
  1.2, 5.6,
  71125, 3.7, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000004', 'venture',
  1395344, 1412008,
  1.2, 5.6,
  49992, 3.7, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000004', 'treasury',
  0, 0,
  NULL, 5.6,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000004', 'coa',
  0, 0,
  NULL, NULL,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000005', 'income',
  1140617, 1154078,
  1.2, 6.8,
  53845, 4.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000005', 'growth',
  2008876, 2032584,
  1.2, 6.8,
  94833, 4.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000005', 'venture',
  1412008, 1428672,
  1.2, 6.8,
  66656, 4.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000005', 'treasury',
  0, 0,
  NULL, 6.8,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000005', 'coa',
  0, 0,
  NULL, NULL,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000006', 'income',
  1154078, 1167539,
  1.2, 8,
  67306, 6.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000006', 'growth',
  2032584, 2056292,
  1.2, 8,
  118541, 6.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000006', 'venture',
  1428672, 1445336,
  1.2, 8,
  83320, 6.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000006', 'treasury',
  0, 0,
  NULL, 8,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000006', 'coa',
  0, 0,
  NULL, NULL,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000007', 'income',
  1167539, 1181000,
  1.2, 9.2,
  80767, 7.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000007', 'growth',
  2056292, 2080000,
  1.2, 9.2,
  142249, 7.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000007', 'venture',
  1445336, 1462000,
  1.2, 9.2,
  99984, 7.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000007', 'treasury',
  0, 0,
  NULL, 9.2,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000007', 'coa',
  0, 0,
  NULL, NULL,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2024-07-25', 4400000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2024-08-25', 4520000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2024-09-25', 4610000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2024-10-25', 4750000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2024-11-25', 4880000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2024-12-25', 4960000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2025-01-25', 5050000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2025-02-25', 5180000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2025-03-31', 5290000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2025-04-25', 5380000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2025-05-25', 5510000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c3000000-0000-4000-8000-000000000001', '2025-06-30', 5620000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c3000000-0000-4000-8000-000000000001', 'venture', '2026-03-08', 200000, 'Digital assets allocation increase', 'deposit'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c3000000-0000-4000-8000-000000000001', 'income', '2026-05-30', 8000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd3000000-0000-4000-8000-000000000001', 'c3000000-0000-4000-8000-000000000001', 'Family trust establishment',
  'Wealth Preservation', 'HeartHandshake', 3000000, 1200000,
  '2027-06-01'::date, false,
  58, 'in-progress'::wealth.goal_status,
  'Legal structure drafted. Awaiting final trust deed execution.',
  'income'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd3000000-0000-4000-8000-000000000002', 'c3000000-0000-4000-8000-000000000001', 'Digital assets growth target',
  'Business Expansion', 'TrendingUp', 2000000, 1462000,
  '2028-12-01'::date, false,
  84, 'ahead'::wealth.goal_status,
  'Digital allocation outperforming. Rebalance discussion scheduled for Q3.',
  'venture'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd3000000-0000-4000-8000-000000000003', 'c3000000-0000-4000-8000-000000000001', 'Daughter university fund',
  'Children''s Education', 'GraduationCap', 250000, 89000,
  '2034-09-01'::date, false,
  71, 'on-track'::wealth.goal_status,
  'Education sub-account growing steadily.',
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c3000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Estate plan: will review marked complete',
  'Will review completed and filed to vault.', now() - interval '24 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c3000000-0000-4000-8000-000000000001', 'portfolio'::wealth.update_kind, 'Digital assets position increased',
  'Digital assets allocation increased per client request after risk review.', now() - interval '43 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c3000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Trust structure review initiated',
  'Family trust legal pack shared with client counsel.', now() - interval '58 days');
INSERT INTO wealth.client_advisor_notes (client_id, author_advisor_id, body)
SELECT 'c3000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Priya has a strong appetite for digital assets and has doubled her allocation this year. Key focus now is setting up a family trust. Prefers brief written updates over calls.'
WHERE NOT EXISTS (
  SELECT 1 FROM wealth.client_advisor_notes n WHERE n.client_id = 'c3000000-0000-4000-8000-000000000001'
);
INSERT INTO wealth.message_threads (client_id, advisor_id)
SELECT 'c3000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM wealth.message_threads t WHERE t.client_id = 'c3000000-0000-4000-8000-000000000001');

-- Daniel Osei
INSERT INTO wealth.clients (
  id, client_number, reference_code, full_name, email, phone, currency, inception_date,
  advisor_id, status, risk_profile, investment_horizon, primary_objective,
  marital_status, dependents, estate_status, financial_goals, advisor_notes,
  date_of_birth, review_cadence, next_review_date, last_contact_date, risk_assessed_at
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'JA-2SAAAAAA', 'JA-2SAAAAAA', 'Daniel Osei', 'd.osei@osei-holdings.com', '+44 7700 900321',
  'USD', '2020-06-15', 'a0000000-0000-4000-8000-000000000002',
  'review_due'::wealth.client_status,
  'Moderate-aggressive', '10+ years', 'Recover performance and rebalance risk',
  'Divorced', 2, 'No active estate plan',
  'Stabilise portfolio performance, reduce commodities exposure, and begin estate planning.', 'Daniel has been difficult to reach over the past month. His commodities and equities positions are underperforming. Urgent to schedule a review and discuss rebalancing strategy. Consider reducing high-risk exposure.',
  '1979-02-17',
  'annual'::wealth.review_cadence,
  '2026-04-30'::date,
  '2026-05-15'::date,
  CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  advisor_notes = EXCLUDED.advisor_notes;
INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
VALUES ('c4000000-0000-4000-8000-000000000001', '45 The Calls', 'Leeds', 'West Yorkshire', 'LS2 7EY', 'GB', true)
ON CONFLICT DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b4000000-0000-4000-8000-000000000001', 'c4000000-0000-4000-8000-000000000001', '2024-09-25', '2024-12-25', 'Q4 2024 (25 Sep - 25 Dec 2024)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b4000000-0000-4000-8000-000000000002', 'c4000000-0000-4000-8000-000000000001', '2025-01-01', '2025-03-31', 'Q1 2025 (1 Jan - 31 Mar 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b4000000-0000-4000-8000-000000000003', 'c4000000-0000-4000-8000-000000000001', '2025-04-01', '2025-06-30', 'Q2 2025 (1 Apr - 30 Jun 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b4000000-0000-4000-8000-000000000004', 'c4000000-0000-4000-8000-000000000001', '2025-07-01', '2025-09-30', 'Q3 2025 (1 Jul - 30 Sep 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b4000000-0000-4000-8000-000000000005', 'c4000000-0000-4000-8000-000000000001', '2025-10-01', '2025-12-31', 'Q4 2025 (1 Oct - 31 Dec 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b4000000-0000-4000-8000-000000000006', 'c4000000-0000-4000-8000-000000000001', '2026-01-01', '2026-03-31', 'Q1 2026 (1 Jan - 31 Mar 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b4000000-0000-4000-8000-000000000007', 'c4000000-0000-4000-8000-000000000001', '2026-04-01', '2026-06-30', 'Q2 2026 (1 Apr - 30 Jun 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'income',
  468000, 468000,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'growth',
  1040000, 1040000,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'venture',
  884000, 884000,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'treasury',
  0, 0,
  NULL, 2,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'coa',
  208000, 208000,
  0, 2,
  0, 0, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000002', 'income',
  468000, 463200,
  -1, 3.2,
  -4800, -1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000002', 'growth',
  1040000, 1029333,
  -1, 3.2,
  -10667, -1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000002', 'venture',
  884000, 874933,
  -1, 3.2,
  -9067, -1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000002', 'treasury',
  0, 0,
  NULL, 3.2,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000002', 'coa',
  208000, 205867,
  -1, 3.2,
  -2133, -1, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000003', 'income',
  463200, 458400,
  -1, 4.4,
  -9600, -2.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000003', 'growth',
  1029333, 1018667,
  -1, 4.4,
  -21333, -2.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000003', 'venture',
  874933, 865867,
  -1, 4.4,
  -18133, -2.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000003', 'treasury',
  0, 0,
  NULL, 4.4,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000003', 'coa',
  205867, 203733,
  -1, 4.4,
  -4267, -2.1, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000004', 'income',
  458400, 453600,
  -1, 5.6,
  -14400, -3.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000004', 'growth',
  1018667, 1008000,
  -1, 5.6,
  -32000, -3.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000004', 'venture',
  865867, 856800,
  -1, 5.6,
  -27200, -3.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000004', 'treasury',
  0, 0,
  NULL, 5.6,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000004', 'coa',
  203733, 201600,
  -1, 5.6,
  -6400, -3.1, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000005', 'income',
  453600, 448800,
  -1.1, 6.8,
  -19200, -4.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000005', 'growth',
  1008000, 997333,
  -1.1, 6.8,
  -42667, -4.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000005', 'venture',
  856800, 847733,
  -1.1, 6.8,
  -36267, -4.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000005', 'treasury',
  0, 0,
  NULL, 6.8,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000005', 'coa',
  201600, 199467,
  -1.1, 6.8,
  -8533, -4.1, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000006', 'income',
  448800, 444000,
  -1.1, 8,
  -24000, -5.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000006', 'growth',
  997333, 986667,
  -1.1, 8,
  -53333, -5.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000006', 'venture',
  847733, 838667,
  -1.1, 8,
  -45333, -5.1, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000006', 'treasury',
  0, 0,
  NULL, 8,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000006', 'coa',
  199467, 197333,
  -1.1, 8,
  -10667, -5.1, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000007', 'income',
  444000, 439200,
  -1.1, 9.2,
  -28800, -6.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000007', 'growth',
  986667, 976000,
  -1.1, 9.2,
  -64000, -6.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000007', 'venture',
  838667, 829600,
  -1.1, 9.2,
  -54400, -6.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000007', 'treasury',
  0, 0,
  NULL, 9.2,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c4000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000007', 'coa',
  197333, 195200,
  -1.1, 9.2,
  -12800, -6.2, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2024-07-25', 2600000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2024-08-25', 2580000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2024-09-25', 2560000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2024-10-25', 2520000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2024-11-25', 2490000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2024-12-25', 2510000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2025-01-25', 2480000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2025-02-25', 2460000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2025-03-31', 2450000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2025-04-25', 2440000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2025-05-25', 2455000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c4000000-0000-4000-8000-000000000001', '2025-06-30', 2440000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c4000000-0000-4000-8000-000000000001', 'venture', '2025-12-12', 50000, 'Commodities position reduction', 'transfer'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c4000000-0000-4000-8000-000000000001', 'income', '2026-02-05', 6000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd4000000-0000-4000-8000-000000000001', 'c4000000-0000-4000-8000-000000000001', 'Portfolio recovery target',
  'Wealth Preservation', 'Shield', 2800000, 2440000,
  '2027-12-01'::date, false,
  42, 'at-risk'::wealth.goal_status,
  'Underperformance in commodities dragging total return. Rebalancing plan needed urgently.',
  'growth'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd4000000-0000-4000-8000-000000000002', 'c4000000-0000-4000-8000-000000000001', 'Estate plan initiation',
  'Wealth Preservation', 'HeartHandshake', 500000, 0,
  '2027-06-01'::date, false,
  35, 'at-risk'::wealth.goal_status,
  'No estate plan in place. Schedule estate planning intake.',
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c4000000-0000-4000-8000-000000000001', 'note'::wealth.update_kind, 'Quarterly check-in missed',
  'Scheduled check-in missed. Rescheduled to 22 Jun 2026.', now() - interval '31 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c4000000-0000-4000-8000-000000000001', 'portfolio'::wealth.update_kind, 'Portfolio performance flagged for review',
  'YTD underperformance flagged for advisor review.', now() - interval '48 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c4000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Annual review overdue',
  'Annual review was due 30 Apr 2026. Client unresponsive to scheduling.', now() - interval '63 days');
INSERT INTO wealth.client_advisor_notes (client_id, author_advisor_id, body)
SELECT 'c4000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Daniel has been difficult to reach over the past month. His commodities and equities positions are underperforming. Urgent to schedule a review and discuss rebalancing strategy. Consider reducing high-risk exposure.'
WHERE NOT EXISTS (
  SELECT 1 FROM wealth.client_advisor_notes n WHERE n.client_id = 'c4000000-0000-4000-8000-000000000001'
);
INSERT INTO wealth.message_threads (client_id, advisor_id)
SELECT 'c4000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM wealth.message_threads t WHERE t.client_id = 'c4000000-0000-4000-8000-000000000001');

-- Amara Diallo
INSERT INTO wealth.clients (
  id, client_number, reference_code, full_name, email, phone, currency, inception_date,
  advisor_id, status, risk_profile, investment_horizon, primary_objective,
  marital_status, dependents, estate_status, financial_goals, advisor_notes,
  date_of_birth, review_cadence, next_review_date, last_contact_date, risk_assessed_at
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'JA-2WAAAAAA', 'JA-2WAAAAAA', 'Amara Diallo', 'amara@diallogroup.africa', '+44 7700 900654',
  'USD', '2018-11-20', 'a0000000-0000-4000-8000-000000000002',
  'active'::wealth.client_status,
  'Balanced-growth', '25+ years', 'Pan-African real estate and generational wealth',
  'Married', 4, 'Succession plan and trusts fully established',
  'Expand African real estate exposure, maintain succession structures, and fund philanthropic initiatives.', 'Amara is our highest-value client and has a very clear long-term strategy. Bi-monthly advisory calls are standard. She is exploring expansion into African real estate markets via a new property fund.',
  '1970-06-09',
  'quarterly'::wealth.review_cadence,
  '2026-09-30'::date,
  '2026-06-13'::date,
  CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  advisor_notes = EXCLUDED.advisor_notes;
INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
VALUES ('c5000000-0000-4000-8000-000000000001', '1 Knightsbridge', 'London', 'Greater London', 'SW1X 7LY', 'GB', true)
ON CONFLICT DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b5000000-0000-4000-8000-000000000001', 'c5000000-0000-4000-8000-000000000001', '2024-09-25', '2024-12-25', 'Q4 2024 (25 Sep - 25 Dec 2024)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b5000000-0000-4000-8000-000000000002', 'c5000000-0000-4000-8000-000000000001', '2025-01-01', '2025-03-31', 'Q1 2025 (1 Jan - 31 Mar 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b5000000-0000-4000-8000-000000000003', 'c5000000-0000-4000-8000-000000000001', '2025-04-01', '2025-06-30', 'Q2 2025 (1 Apr - 30 Jun 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b5000000-0000-4000-8000-000000000004', 'c5000000-0000-4000-8000-000000000001', '2025-07-01', '2025-09-30', 'Q3 2025 (1 Jul - 30 Sep 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b5000000-0000-4000-8000-000000000005', 'c5000000-0000-4000-8000-000000000001', '2025-10-01', '2025-12-31', 'Q4 2025 (1 Oct - 31 Dec 2025)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b5000000-0000-4000-8000-000000000006', 'c5000000-0000-4000-8000-000000000001', '2026-01-01', '2026-03-31', 'Q1 2026 (1 Jan - 31 Mar 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b5000000-0000-4000-8000-000000000007', 'c5000000-0000-4000-8000-000000000001', '2026-04-01', '2026-06-30', 'Q2 2026 (1 Apr - 30 Jun 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'income',
  1615000, 1615000,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'growth',
  3315000, 3315000,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'venture',
  680000, 680000,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'treasury',
  2465000, 2465000,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'coa',
  425000, 425000,
  0, 2,
  0, 0, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000002', 'income',
  1615000, 1700500,
  5.3, 3.2,
  85500, 5.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000002', 'growth',
  3315000, 3490500,
  5.3, 3.2,
  175500, 5.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000002', 'venture',
  680000, 716000,
  5.3, 3.2,
  36000, 5.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000002', 'treasury',
  2465000, 2595500,
  5.3, 3.2,
  130500, 5.3, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000002', 'coa',
  425000, 447500,
  5.3, 3.2,
  22500, 5.3, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000003', 'income',
  1700500, 1786000,
  5, 4.4,
  171000, 10.6, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000003', 'growth',
  3490500, 3666000,
  5, 4.4,
  351000, 10.6, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000003', 'venture',
  716000, 752000,
  5, 4.4,
  72000, 10.6, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000003', 'treasury',
  2595500, 2726000,
  5, 4.4,
  261000, 10.6, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000003', 'coa',
  447500, 470000,
  5, 4.4,
  45000, 10.6, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000004', 'income',
  1786000, 1871500,
  4.8, 5.6,
  256500, 15.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000004', 'growth',
  3666000, 3841500,
  4.8, 5.6,
  526500, 15.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000004', 'venture',
  752000, 788000,
  4.8, 5.6,
  108000, 15.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000004', 'treasury',
  2726000, 2856500,
  4.8, 5.6,
  391500, 15.9, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000004', 'coa',
  470000, 492500,
  4.8, 5.6,
  67500, 15.9, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000005', 'income',
  1871500, 1957000,
  4.6, 6.8,
  342000, 21.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000005', 'growth',
  3841500, 4017000,
  4.6, 6.8,
  702000, 21.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000005', 'venture',
  788000, 824000,
  4.6, 6.8,
  144000, 21.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000005', 'treasury',
  2856500, 2987000,
  4.6, 6.8,
  522000, 21.2, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000005', 'coa',
  492500, 515000,
  4.6, 6.8,
  90000, 21.2, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000006', 'income',
  1957000, 2042500,
  4.4, 8,
  427500, 26.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000006', 'growth',
  4017000, 4192500,
  4.4, 8,
  877500, 26.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000006', 'venture',
  824000, 860000,
  4.4, 8,
  180000, 26.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000006', 'treasury',
  2987000, 3117500,
  4.4, 8,
  652500, 26.5, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000006', 'coa',
  515000, 537500,
  4.4, 8,
  112500, 26.5, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000007', 'income',
  2042500, 2128000,
  4.2, 9.2,
  513000, 31.8, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000007', 'growth',
  4192500, 4368000,
  4.2, 9.2,
  1053000, 31.8, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000007', 'venture',
  860000, 896000,
  4.2, 9.2,
  216000, 31.8, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000007', 'treasury',
  3117500, 3248000,
  4.2, 9.2,
  783000, 31.8, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c5000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000007', 'coa',
  537500, 560000,
  4.2, 9.2,
  135000, 31.8, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2024-07-25', 8500000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2024-08-25', 8800000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2024-09-25', 9050000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2024-10-25', 9280000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2024-11-25', 9500000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2024-12-25', 9700000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2025-01-25', 9950000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2025-02-25', 10200000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2025-03-31', 10450000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2025-04-25', 10700000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2025-05-25', 10960000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c5000000-0000-4000-8000-000000000001', '2025-06-30', 11200000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c5000000-0000-4000-8000-000000000001', 'treasury', '2026-05-28', 680000, 'Bristol property acquisition', 'deposit'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c5000000-0000-4000-8000-000000000001', 'income', '2026-04-15', 22000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.transactions (client_id, bucket, occurred_on, amount_usd, description, transaction_type)
VALUES ('c5000000-0000-4000-8000-000000000001', 'income', '2026-01-08', 19000, 'Income Portfolio Drawdown', 'drawdown'::wealth.transaction_type);
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd5000000-0000-4000-8000-000000000001', 'c5000000-0000-4000-8000-000000000001', 'African real estate fund allocation',
  'Property Purchase', 'Building2', 5000000, 3248000,
  '2029-06-01'::date, false,
  77, 'on-track'::wealth.goal_status,
  'Bristol property acquired. African fund diligence underway.',
  'treasury'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd5000000-0000-4000-8000-000000000002', 'c5000000-0000-4000-8000-000000000001', 'Generational wealth trust',
  'Wealth Preservation', 'HeartHandshake', 15000000, 11200000,
  NULL, true,
  88, 'on-track'::wealth.goal_status,
  'Trusts fully established. Bi-monthly family briefings continue.',
  'growth'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd5000000-0000-4000-8000-000000000003', 'c5000000-0000-4000-8000-000000000001', 'Philanthropic giving fund',
  'Philanthropic Giving', 'Gift', 1000000, 420000,
  '2028-12-01'::date, false,
  69, 'in-progress'::wealth.goal_status,
  'Education foundation contributions planned for Q4 2026.',
  'income'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c5000000-0000-4000-8000-000000000001', 'note'::wealth.update_kind, 'Bi-monthly advisory call completed',
  'Portfolio and succession review completed on scheduled call.', now() - interval '19 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c5000000-0000-4000-8000-000000000001', 'portfolio'::wealth.update_kind, 'Bristol property acquisition noted',
  'New Bristol commercial property added to treasury bucket.', now() - interval '35 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c5000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'Annual review: all targets met',
  '2026 annual review completed. All long-term targets on track.', now() - interval '168 days');
INSERT INTO wealth.client_advisor_notes (client_id, author_advisor_id, body)
SELECT 'c5000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Amara is our highest-value client and has a very clear long-term strategy. Bi-monthly advisory calls are standard. She is exploring expansion into African real estate markets via a new property fund.'
WHERE NOT EXISTS (
  SELECT 1 FROM wealth.client_advisor_notes n WHERE n.client_id = 'c5000000-0000-4000-8000-000000000001'
);
INSERT INTO wealth.message_threads (client_id, advisor_id)
SELECT 'c5000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM wealth.message_threads t WHERE t.client_id = 'c5000000-0000-4000-8000-000000000001');

-- Theo Baxter
INSERT INTO wealth.clients (
  id, client_number, reference_code, full_name, email, phone, currency, inception_date,
  advisor_id, status, risk_profile, investment_horizon, primary_objective,
  marital_status, dependents, estate_status, financial_goals, advisor_notes,
  date_of_birth, review_cadence, next_review_date, last_contact_date, risk_assessed_at
) VALUES (
  'c6000000-0000-4000-8000-000000000001', 'JA-22AAAAAA', 'JA-22AAAAAA', 'Theo Baxter', 'theo.baxter@tbaxter.co.uk', '+44 7700 900987',
  'USD', '2026-06-01', 'a0000000-0000-4000-8000-000000000002',
  'onboarding'::wealth.client_status,
  'Growth-oriented', '15+ years', 'Diversify from tech equity into managed portfolios',
  'Single', 0, 'Not started',
  'Complete onboarding, establish initial allocation, and plan first property investment.', 'Theo is a new client referred by Marcus Webb. He is a tech entrepreneur looking to diversify into managed equities and UK real estate. Still completing onboarding documentation.',
  '1990-09-14',
  NULL,
  NULL,
  '2026-06-15'::date,
  CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  advisor_notes = EXCLUDED.advisor_notes;
INSERT INTO wealth.client_addresses (client_id, line1, city, region, postal_code, country, is_primary)
VALUES ('c6000000-0000-4000-8000-000000000001', '12 George Street', 'Edinburgh', 'Scotland', 'EH2 2PF', 'GB', true)
ON CONFLICT DO NOTHING;
INSERT INTO wealth.statement_periods (id, client_id, period_start, period_end, label)
VALUES ('b6000000-0000-4000-8000-000000000007', 'c6000000-0000-4000-8000-000000000001', '2026-04-01', '2026-06-30', 'Q2 2026 (1 Apr - 30 Jun 2026)')
ON CONFLICT (client_id, period_start, period_end) DO NOTHING;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c6000000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000007', 'income',
  604800, 604800,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c6000000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000007', 'growth',
  907200, 907200,
  0, 2,
  0, 0, 8
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c6000000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000007', 'venture',
  0, 0,
  NULL, 2,
  NULL, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c6000000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000007', 'treasury',
  0, 0,
  NULL, 2,
  100000, NULL, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_snapshots (
  client_id, period_id, bucket, previous_value_usd, current_value_usd,
  period_change_pct, ytd_pct, inception_gain_usd, inception_pct, annualized_return_pct
) VALUES (
  'c6000000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000007', 'coa',
  378000, 378000,
  0, 2,
  0, 0, NULL
) ON CONFLICT (client_id, period_id, bucket) DO UPDATE SET
  previous_value_usd = EXCLUDED.previous_value_usd,
  current_value_usd = EXCLUDED.current_value_usd,
  period_change_pct = EXCLUDED.period_change_pct,
  ytd_pct = EXCLUDED.ytd_pct,
  inception_gain_usd = EXCLUDED.inception_gain_usd,
  inception_pct = EXCLUDED.inception_pct,
  annualized_return_pct = EXCLUDED.annualized_return_pct;
INSERT INTO wealth.portfolio_history (client_id, recorded_on, total_value_usd)
VALUES ('c6000000-0000-4000-8000-000000000001', '2025-06-30', 1890000)
ON CONFLICT (client_id, recorded_on) DO UPDATE SET total_value_usd = EXCLUDED.total_value_usd;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd6000000-0000-4000-8000-000000000001', 'c6000000-0000-4000-8000-000000000001', 'Initial portfolio allocation',
  'Wealth Preservation', 'Landmark', 1890000, 1890000,
  '2026-09-01'::date, false,
  50, 'in-progress'::wealth.goal_status,
  'Onboarding allocation agreed. Awaiting final KYC clearance.',
  'growth'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_goals (
  id, client_id, name, category, icon_name, target_usd, current_usd,
  target_date, is_ongoing, probability_pct, status, advisor_note, linked_bucket
) VALUES (
  'd6000000-0000-4000-8000-000000000002', 'c6000000-0000-4000-8000-000000000001', 'First UK property deposit',
  'Property Purchase', 'Building2', 800000, 0,
  '2028-03-01'::date, false,
  45, 'in-progress'::wealth.goal_status,
  'Exploring Edinburgh residential market post-onboarding.',
  'treasury'::wealth.portfolio_bucket
) ON CONFLICT (id) DO NOTHING;
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c6000000-0000-4000-8000-000000000001', 'note'::wealth.update_kind, 'Onboarding call completed',
  'Initial onboarding call completed. Risk profile and objectives confirmed.', now() - interval '17 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c6000000-0000-4000-8000-000000000001', 'report'::wealth.update_kind, 'KYC documents submitted',
  'Client submitted KYC documentation for review.', now() - interval '20 days');
INSERT INTO wealth.client_updates (client_id, kind, title, body, created_at)
VALUES ('c6000000-0000-4000-8000-000000000001', 'invite'::wealth.update_kind, 'Welcome pack sent',
  'Portal welcome pack and onboarding checklist sent.', now() - interval '24 days');
INSERT INTO wealth.client_advisor_notes (client_id, author_advisor_id, body)
SELECT 'c6000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Theo is a new client referred by Marcus Webb. He is a tech entrepreneur looking to diversify into managed equities and UK real estate. Still completing onboarding documentation.'
WHERE NOT EXISTS (
  SELECT 1 FROM wealth.client_advisor_notes n WHERE n.client_id = 'c6000000-0000-4000-8000-000000000001'
);
INSERT INTO wealth.message_threads (client_id, advisor_id)
SELECT 'c6000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM wealth.message_threads t WHERE t.client_id = 'c6000000-0000-4000-8000-000000000001');

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';