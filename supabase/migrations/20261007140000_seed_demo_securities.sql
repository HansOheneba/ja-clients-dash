-- Named securities for demo clients. Market values sum to the Q2 2026 bucket totals.
-- Share counts let the portfolio screen price listed names from the market.
-- Cash stays a statement balance. John Doe's report lines stay as they are; US listings get a quantity.

UPDATE wealth.portfolio_holdings
SET quantity = CASE ticker
  WHEN 'CELH' THEN 174
  WHEN 'QQQM' THEN 273
  WHEN 'IWM' THEN 137
  WHEN 'IJJ' THEN 100
  WHEN 'PLTR' THEN 182
  WHEN 'RAAX' THEN 394
  WHEN 'SMH' THEN 125
END
WHERE client_id = 'c0000000-0000-4000-8000-000000000001'
  AND period_id IS NULL
  AND quantity IS NULL
  AND ticker IN ('CELH', 'QQQM', 'IWM', 'IJJ', 'PLTR', 'RAAX', 'SMH');

INSERT INTO wealth.portfolio_holdings (
  client_id, period_id, bucket, investment_name, ticker, quantity,
  original_value_usd, market_value_usd, sort_order
)
SELECT *
FROM (VALUES
  -- Lois Lane. Growth 1,228,000. Income 829,700. Treasury 365,700. Venture 530,000.
  ('c1000000-0000-4000-8000-000000000001'::uuid, NULL::uuid, 'growth'::wealth.portfolio_bucket, 'Vanguard Total Stock Market', 'VTI', 1754::numeric, 450000::numeric, 491200::numeric, 1),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'growth', 'Invesco QQQ', 'QQQ', 640, 280000, 307000, 2),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'growth', 'Microsoft', 'MSFT', 439, 170000, 184200, 3),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'growth', 'Apple', 'AAPL', 641, 140000, 147360, 4),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'growth', 'Johnson & Johnson', 'JNJ', 614, 95000, 98240, 5),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'income', 'Vanguard Total Bond Market', 'BND', 6638, 480000, 497820, 1),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'income', 'iShares Core US Aggregate Bond', 'AGG', 3319, 320000, 331880, 2),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'treasury', 'iShares Core US Aggregate Bond', 'AGG', 2194, 210000, 219420, 1),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'treasury', 'Vanguard Total Bond Market', 'BND', 1950, 140000, 146280, 2),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'venture', 'SPDR Gold Shares', 'GLD', 1546, 340000, 371000, 1),
  ('c1000000-0000-4000-8000-000000000001', NULL, 'venture', 'iShares Gold Trust', 'IAU', 3313, 150000, 159000, 2),

  -- Marcus Webb. Growth 3,174,600. Income 2,600,000. Treasury 1,546,200.
  ('c2000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard S&P 500', 'VOO', 2442, 1100000, 1269840, 1),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard Total Stock Market', 'VTI', 2834, 720000, 793650, 2),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'growth', 'JPMorgan Chase', 'JPM', 2165, 430000, 476190, 3),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'growth', 'Exxon Mobil', 'XOM', 3313, 350000, 380952, 4),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'growth', 'Johnson & Johnson', 'JNJ', 1587, 240000, 253968, 5),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'income', 'Vanguard Total Bond Market', 'BND', 19067, 1350000, 1430000, 1),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'income', 'iShares Core US Aggregate Bond', 'AGG', 11700, 1100000, 1170000, 2),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'treasury', 'iShares Core US Aggregate Bond', 'AGG', 9277, 880000, 927720, 1),
  ('c2000000-0000-4000-8000-000000000001', NULL, 'treasury', 'Vanguard Total Bond Market', 'BND', 8246, 590000, 618480, 2),

  -- Priya Nair. Growth 2,080,000. Income 1,181,000. Venture 1,462,000.
  ('c3000000-0000-4000-8000-000000000001', NULL, 'growth', 'NVIDIA', 'NVDA', 4457, 480000, 624000, 1),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'growth', 'Invesco QQQ', 'QQQ', 1083, 430000, 520000, 2),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'growth', 'Meta Platforms', 'META', 693, 340000, 416000, 3),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'growth', 'Amazon', 'AMZN', 1560, 270000, 312000, 4),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'growth', 'Tesla', 'TSLA', 832, 190000, 208000, 5),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'income', 'Vanguard Total Bond Market', 'BND', 9448, 680000, 708600, 1),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'income', 'iShares Core US Aggregate Bond', 'AGG', 4724, 450000, 472400, 2),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'venture', 'VanEck Semiconductor', 'SMH', 2249, 460000, 584800, 1),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'venture', 'Broadcom', 'AVGO', 2843, 400000, 511700, 2),
  ('c3000000-0000-4000-8000-000000000001', NULL, 'venture', 'Palantir', 'PLTR', 9138, 280000, 365500, 3),

  -- Daniel Osei. Growth 976,000. Income 439,200. Venture 829,600. Costs sit above market value.
  ('c4000000-0000-4000-8000-000000000001', NULL, 'growth', 'Exxon Mobil', 'XOM', 2970, 375000, 341600, 1),
  ('c4000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard FTSE Emerging Markets', 'VWO', 5083, 268000, 244000, 2),
  ('c4000000-0000-4000-8000-000000000001', NULL, 'growth', 'iShares Russell 2000', 'IWM', 1109, 270000, 244000, 3),
  ('c4000000-0000-4000-8000-000000000001', NULL, 'growth', 'Celsius Holdings', 'CELH', 3660, 168000, 146400, 4),
  ('c4000000-0000-4000-8000-000000000001', NULL, 'income', 'Vanguard Total Bond Market', 'BND', 3514, 255000, 263520, 1),
  ('c4000000-0000-4000-8000-000000000001', NULL, 'income', 'iShares Core US Aggregate Bond', 'AGG', 1757, 170000, 175680, 2),
  ('c4000000-0000-4000-8000-000000000001', NULL, 'venture', 'SPDR Gold Shares', 'GLD', 1901, 505000, 456280, 1),
  ('c4000000-0000-4000-8000-000000000001', NULL, 'venture', 'iShares Gold Trust', 'IAU', 7778, 410000, 373320, 2),

  -- Amara Diallo. Growth 4,368,000. Income 2,128,000. Venture 896,000. Treasury 3,248,000.
  ('c5000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard S&P 500', 'VOO', 2520, 1150000, 1310400, 1),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'growth', 'Invesco QQQ', 'QQQ', 1820, 760000, 873600, 2),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'growth', 'Microsoft', 'MSFT', 1560, 580000, 655200, 3),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'growth', 'Apple', 'AAPL', 2849, 590000, 655200, 4),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'growth', 'Alphabet', 'GOOGL', 2496, 390000, 436800, 5),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'growth', 'Eli Lilly', 'LLY', 546, 380000, 436800, 6),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'income', 'Vanguard Total Bond Market', 'BND', 14187, 1000000, 1064000, 1),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'income', 'iShares Core US Aggregate Bond', 'AGG', 10640, 1000000, 1064000, 2),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'venture', 'SPDR Gold Shares', 'GLD', 2240, 480000, 537600, 1),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'venture', 'VanEck Semiconductor', 'SMH', 1378, 300000, 358400, 2),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'treasury', 'Vanguard Total Bond Market', 'BND', 25984, 1850000, 1948800, 1),
  ('c5000000-0000-4000-8000-000000000001', NULL, 'treasury', 'iShares Core US Aggregate Bond', 'AGG', 12992, 1230000, 1299200, 2),

  -- Theo Baxter. Growth 907,200. Income 604,800.
  ('c6000000-0000-4000-8000-000000000001', NULL, 'growth', 'Vanguard Total Stock Market', 'VTI', 1620, 430000, 453600, 1),
  ('c6000000-0000-4000-8000-000000000001', NULL, 'growth', 'Invesco QQQ', 'QQQ', 567, 250000, 272160, 2),
  ('c6000000-0000-4000-8000-000000000001', NULL, 'growth', 'Apple', 'AAPL', 789, 170000, 181440, 3),
  ('c6000000-0000-4000-8000-000000000001', NULL, 'income', 'Vanguard Total Bond Market', 'BND', 4838, 350000, 362880, 1),
  ('c6000000-0000-4000-8000-000000000001', NULL, 'income', 'iShares Core US Aggregate Bond', 'AGG', 2419, 230000, 241920, 2)
) AS seed (
  client_id, period_id, bucket, investment_name, ticker, quantity,
  original_value_usd, market_value_usd, sort_order
)
WHERE NOT EXISTS (
  SELECT 1
  FROM wealth.portfolio_holdings existing
  WHERE existing.client_id = seed.client_id
    AND existing.period_id IS NULL
);
