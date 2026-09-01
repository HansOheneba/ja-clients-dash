import {
  Calendar,
  FileText,
  LayoutDashboard,
  Mail,
  Users,
  Building2,
  FolderOpen,
} from "lucide-react";

import { appConfig } from "@/lib/app-config";
import type { NavItem } from "@/lib/navigation";

const advisorNavItems: NavItem[] = [
  { label: "Overview", href: appConfig.routes.advisor.dashboard, icon: LayoutDashboard },
  { label: "Clients", href: `${appConfig.routes.advisor.clients}`, icon: Users },
  { label: "Sessions", href: `${appConfig.routes.advisor.dashboard}/sessions`, icon: Calendar },
  { label: "Reports", href: `${appConfig.routes.advisor.dashboard}/reports`, icon: FileText },
  { label: "Documents", href: `${appConfig.routes.advisor.dashboard}/documents`, icon: FolderOpen },
  { label: "Messages", href: `${appConfig.routes.advisor.dashboard}/messages`, icon: Mail },
];

const teamNavItem: NavItem = {
  label: "Team",
  href: `${appConfig.routes.advisor.dashboard}/team`,
  icon: Building2,
};

function advisorNavItemsForRole(_role: string): NavItem[] {
  const items = [...advisorNavItems];
  const messagesIndex = items.findIndex((item) => item.label === "Messages");
  const insertAt = messagesIndex === -1 ? items.length : messagesIndex + 1;
  items.splice(insertAt, 0, teamNavItem);
  return items;
}

export { advisorNavItems, advisorNavItemsForRole };
