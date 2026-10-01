// Central design tokens for the dashboard UI.
// Edit these values to restyle components globally across the app.

export const dashboardTheme = {
  // Applied to every KPI tile. Matches advisor MetricCard density.
  kpiTile:
    "rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(32,35,86,0.03)]",
} as const;

export const kpiSurfaceTones = {
  navy: "border-[#d9dde9] bg-[#eef0f7]",
  gold: "border-[#e8dcc8] bg-[#f7f1e8]",
  sage: "border-[#d7e2cf] bg-[#eef3ea]",
  warm: "border-[#ead9cc] bg-[#f8efe9]",
  plain: "border-border/70 bg-card",
} as const;
