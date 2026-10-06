export type TrackableAsset = {
  symbol: string;
  name: string;
  kind: "Stock" | "ETF";
};

/** Listed names Finnhub can price. Anything outside this list is a manual value. */
export const TRACKABLE_ASSETS: TrackableAsset[] = [
  { symbol: "AAPL", name: "Apple", kind: "Stock" },
  { symbol: "MSFT", name: "Microsoft", kind: "Stock" },
  { symbol: "NVDA", name: "NVIDIA", kind: "Stock" },
  { symbol: "AMZN", name: "Amazon", kind: "Stock" },
  { symbol: "GOOGL", name: "Alphabet", kind: "Stock" },
  { symbol: "META", name: "Meta Platforms", kind: "Stock" },
  { symbol: "TSLA", name: "Tesla", kind: "Stock" },
  { symbol: "AVGO", name: "Broadcom", kind: "Stock" },
  { symbol: "LLY", name: "Eli Lilly", kind: "Stock" },
  { symbol: "JPM", name: "JPMorgan Chase", kind: "Stock" },
  { symbol: "V", name: "Visa", kind: "Stock" },
  { symbol: "UNH", name: "UnitedHealth", kind: "Stock" },
  { symbol: "XOM", name: "Exxon Mobil", kind: "Stock" },
  { symbol: "JNJ", name: "Johnson & Johnson", kind: "Stock" },
  { symbol: "MA", name: "Mastercard", kind: "Stock" },
  { symbol: "PLTR", name: "Palantir", kind: "Stock" },
  { symbol: "CELH", name: "Celsius Holdings", kind: "Stock" },
  { symbol: "SPY", name: "SPDR S&P 500", kind: "ETF" },
  { symbol: "VOO", name: "Vanguard S&P 500", kind: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ", kind: "ETF" },
  { symbol: "QQQM", name: "Invesco Nasdaq 100", kind: "ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market", kind: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000", kind: "ETF" },
  { symbol: "IJJ", name: "iShares S&P 400 Mid Cap", kind: "ETF" },
  { symbol: "SMH", name: "VanEck Semiconductor", kind: "ETF" },
  { symbol: "RAAX", name: "VanEck Real Assets", kind: "ETF" },
  { symbol: "VEA", name: "Vanguard FTSE Developed Markets", kind: "ETF" },
  { symbol: "VWO", name: "Vanguard FTSE Emerging Markets", kind: "ETF" },
  { symbol: "BND", name: "Vanguard Total Bond Market", kind: "ETF" },
  { symbol: "AGG", name: "iShares Core US Aggregate Bond", kind: "ETF" },
  { symbol: "GLD", name: "SPDR Gold Shares", kind: "ETF" },
  { symbol: "IAU", name: "iShares Gold Trust", kind: "ETF" },
];

export function filterTrackableAssets(query: string): TrackableAsset[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return TRACKABLE_ASSETS;
  return TRACKABLE_ASSETS.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(needle) || asset.name.toLowerCase().includes(needle),
  );
}

export function mergeTrackableAssets(
  primary: TrackableAsset[],
  extra: TrackableAsset[],
): TrackableAsset[] {
  const seen = new Set(primary.map((asset) => asset.symbol.toUpperCase()));
  const merged = [...primary];
  for (const asset of extra) {
    const symbol = asset.symbol.toUpperCase();
    if (seen.has(symbol)) continue;
    seen.add(symbol);
    merged.push({ ...asset, symbol });
  }
  return merged.slice(0, 40);
}
