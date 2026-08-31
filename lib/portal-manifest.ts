/**
 * Machine-readable inventory for splitting into standalone client and advisor apps.
 * Used by docs/SPLIT.md. Do not import from app code unless building split tooling.
 */

export const PORTAL_MANIFEST = {
  client: {
    appRoutes: [
      "app/clients/dashboard",
      "app/(auth)",
      "app/welcome/page.tsx",
      "app/onboarding/page.tsx",
    ],
    lib: [
      "lib/client-navigation.ts",
      "lib/currency-context.tsx",
      "lib/api/client",
    ],
    libData: [
      "lib/data/overview.ts",
      "lib/data/profile.ts",
      "lib/data/messages.ts",
      "lib/data/market-insights.ts",
    ],
    components: [
      "components/goals",
      "components/celerey",
    ],
    deleteWhenStandalone: [
      "app/advisors",
      "lib/advisor-navigation.ts",
      "lib/advisor-clients-data.ts",
      "lib/api/advisor",
      "lib/data/advisor-overview.ts",
      "lib/data/advisor-tasks.ts",
      "lib/data/advisor-sessions.ts",
      "lib/data/advisor-messages.ts",
      "lib/data/advisor-market-insights.ts",
      "components/advisors",
      "components/layout/portal-switcher.tsx",
    ],
  },

  advisor: {
    appRoutes: [
      "app/advisors/dashboard",
      "app/(auth)",
    ],
    lib: [
      "lib/advisor-navigation.ts",
      "lib/advisor-clients-data.ts",
      "lib/api/advisor",
    ],
    libData: [
      "lib/data/advisor-overview.ts",
      "lib/data/advisor-tasks.ts",
      "lib/data/advisor-sessions.ts",
      "lib/data/advisor-messages.ts",
      "lib/data/advisor-market-insights.ts",
    ],
    components: [
      "components/advisors",
      "components/goals",
      "components/celerey",
      "components/charts",
    ],
    deleteWhenStandalone: [
      "app/clients",
      "lib/client-navigation.ts",
      "lib/currency-context.tsx",
      "lib/api/client",
      "lib/data/overview.ts",
      "lib/data/profile.ts",
      "lib/data/messages.ts",
      "lib/data/market-insights.ts",
      "components/layout/portal-switcher.tsx",
      "components/layout/currency-toggle.tsx",
    ],
  },

  /** Domain data both portals read/write (becomes shared API package or backend contracts). */
  shared: {
    lib: [
      "lib/utils.ts",
      "lib/navigation.ts",
      "lib/breadcrumbs.ts",
      "lib/dashboard-theme.ts",
      "lib/app-config.ts",
      "lib/api/domain",
      "lib/celerey",
    ],
    libData: [
      "lib/data/portfolio.ts",
      "lib/data/goals.ts",
      "lib/data/goals-analytics.ts",
      "lib/data/wealth-plan.ts",
      "lib/data/liabilities.ts",
      "lib/data/tasks.ts",
      "lib/data/documents.ts",
      "lib/data/legacy.ts",
      "lib/data/concierge.ts",
      "lib/data/sessions.ts",
      "lib/data/advisor-insights.ts",
      "lib/data/celerey.ts",
    ],
    components: [
      "components/ui",
      "components/layout/dashboard-shell.tsx",
      "components/layout/dashboard-top-bar.tsx",
      "components/layout/dashboard-top-bar-actions.tsx",
      "components/layout/dashboard-breadcrumbs.tsx",
      "components/layout/page-shell.tsx",
      "components/layout/nav-icon.tsx",
      "components/layout/sidebar-toggle.tsx",
      "components/auth",
    ],
    app: [
      "app/layout.tsx",
      "app/globals.css",
      "public",
    ],
  },

  /** Safe to delete from both apps when cleaning up the combined repo. */
  legacy: [
    "app/dashboard",
    "app/assets",
    "app/documents",
    "app/legacy",
    "app/request",
    "app/design-system",
    "components/dashboard",
    "components/design-system-preview.tsx",
    "lib/data/ja-universe.ts",
    "components/advisors/add-client-sheet.tsx",
  ],
} as const;
