-- Shares or units held. Live market value is quantity times the latest price.
ALTER TABLE wealth.portfolio_holdings
  ADD COLUMN IF NOT EXISTS quantity NUMERIC(18, 6);
