import {
  Building2,
  FileText,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";

import { appConfig } from "@/lib/app-config";
import type { NavItem } from "@/lib/navigation";

const advisorNavItems: NavItem[] = [
  { label: "Overview", href: appConfig.routes.advisor.dashboard, icon: LayoutDashboard },
  { label: "Clients", href: `${appConfig.routes.advisor.clients}`, icon: Users },
  { label: "Reports", href: `${appConfig.routes.advisor.dashboard}/reports`, icon: FileText },
  {
    label: "Demo gallery",
    href: `${appConfig.routes.advisor.dashboard}/demo`,
    icon: Sparkles,
  },
];

const teamNavItem: NavItem = {
  label: "Team",
  href: `${appConfig.routes.advisor.dashboard}/team`,
  icon: Building2,
};

/** Every wealth manager can manage the shared team and client book. */
function advisorNavItemsForRole(_role: string): NavItem[] {
  const items = [...advisorNavItems];
  const reportsIndex = items.findIndex((item) => item.label === "Reports");
  const insertAt = reportsIndex === -1 ? items.length : reportsIndex + 1;
  items.splice(insertAt, 0, teamNavItem);
  return items;
}

export { advisorNavItems, advisorNavItemsForRole };
