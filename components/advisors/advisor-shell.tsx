"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { advisorNavItemsForRole } from "@/lib/advisor-navigation";

function initialsFrom(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Nav items carry icon components, which cannot cross the server boundary, so
 * the shell resolves them on the client from the role it is handed.
 */
export function AdvisorShell({
  userName,
  role,
  children,
}: {
  userName: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      navItems={advisorNavItemsForRole(role)}
      basePath="/advisors/dashboard"
      accountLabel={role === "admin" ? "Admin account" : "Wealth manager account"}
      userName={userName}
      userInitials={initialsFrom(userName)}
      profileHref="/advisors/dashboard/settings"
    >
      {children}
    </DashboardShell>
  );
}
