import type { ReportHoldingRow } from "@/lib/reports/types";

/** Growth portfolio line items from the JA Wealth reference report (John Doe, June 2026). */
export const JOHN_DOE_TEMPLATE_GROWTH_HOLDINGS: Omit<ReportHoldingRow, "bucket">[] = [
  { id: "h-celh", name: "Celsius Holdings Inc.", ticker: "CELH", originalValueUsd: 8750, marketValueUsd: 6942 },
  { id: "h-decalia", name: "Decalia Aegis Defense", ticker: "LU3269411313", originalValueUsd: 18750, marketValueUsd: 17665 },
  { id: "h-qqqm", name: "Invesco Nasdaq 100", ticker: "QQQM", originalValueUsd: 43750, marketValueUsd: 54553 },
  { id: "h-iwm", name: "iShares Russell 2000 ETF", ticker: "IWM", originalValueUsd: 25000, marketValueUsd: 30190 },
  { id: "h-ijj", name: "iShares S&P 400 Mid Cap", ticker: "IJJ", originalValueUsd: 12500, marketValueUsd: 13968 },
  { id: "h-pltr", name: "Palantir Technologies Inc.", ticker: "PLTR", originalValueUsd: 10000, marketValueUsd: 7294 },
  { id: "h-raax", name: "VanEck Real Assets ETF", ticker: "RAAX", originalValueUsd: 12500, marketValueUsd: 12596 },
  { id: "h-smh", name: "VanEck Semiconductor ETF", ticker: "SMH", originalValueUsd: 18750, marketValueUsd: 31207 },
  { id: "h-vwcg", name: "Vanguard Developed Europe", ticker: "VWCG", originalValueUsd: 18750, marketValueUsd: 20738 },
  { id: "h-vhve", name: "Vanguard Developed World", ticker: "VHVE", originalValueUsd: 13750, marketValueUsd: 15694 },
  { id: "h-vfea", name: "Vanguard FTSE Emerg Mkts", ticker: "VFEA", originalValueUsd: 25000, marketValueUsd: 27558 },
  { id: "h-vuaa", name: "Vanguard S&P 500", ticker: "VUAA", originalValueUsd: 37500, marketValueUsd: 42008 },
];
