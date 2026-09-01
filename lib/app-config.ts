/**
 * App-wide config for routing and portal mode.
 *
 * When you split into two standalone apps, set NEXT_PUBLIC_PORTAL to "client" or
 * "advisor" in each app's .env. Keep "dual" only in this combined dev repo.
 */

export type PortalMode = "dual" | "client" | "advisor";

export const appConfig = {
  portal: (process.env.NEXT_PUBLIC_PORTAL ?? "dual") as PortalMode,

    routes: {
    client: {
      dashboard: "/clients/dashboard",
      messages: "/clients/dashboard/messages",
      documents: "/clients/dashboard/documents",
      sessions: "/clients/dashboard/sessions",
      advisor: "/clients/dashboard/advisor",
      concierge: "/clients/dashboard/concierge",
      profile: "/clients/dashboard/profile",
      settings: "/clients/dashboard/settings",
      goals: "/clients/dashboard/goals",
    },
    advisor: {
      dashboard: "/advisors/dashboard",
      clients: "/advisors/dashboard/clients",
      profile: "/advisors/dashboard/settings",
      settings: "/advisors/dashboard/settings",
    },
  },
} as const;

export function isDualPortal(): boolean {
  return appConfig.portal === "dual";
}

export function isClientPortal(): boolean {
  return appConfig.portal === "client" || appConfig.portal === "dual";
}

export function isAdvisorPortal(): boolean {
  return appConfig.portal === "advisor" || appConfig.portal === "dual";
}
