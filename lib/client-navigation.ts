import {
  FileText,
  LayoutDashboard,
  PieChart,
  Sparkles,
  Target,
  User,
} from "lucide-react";

import { appConfig } from "@/lib/app-config";
import type { NavItem } from "@/lib/navigation";

const { dashboard } = appConfig.routes.client;

const clientNavItems: NavItem[] = [
  { label: "Dashboard", href: dashboard, icon: LayoutDashboard },
  { label: "My Portfolio", href: `${dashboard}/portfolio`, icon: PieChart },
  { label: "Goals", href: `${dashboard}/goals`, icon: Target },
  { label: "Reports", href: `${dashboard}/reports`, icon: FileText },
  { label: "Profile", href: `${dashboard}/profile`, icon: User },
  {
    label: "Demo gallery",
    href: `${dashboard}/demo`,
    icon: Sparkles,
  },
];

export { clientNavItems };
