"use client";

import { CurrencyToggle } from "@/components/layout/currency-toggle";
import { DashboardBreadcrumbs } from "@/components/layout/dashboard-breadcrumbs";
import { DashboardTopBarActions } from "@/components/layout/dashboard-top-bar-actions";
import { SidebarToggle } from "@/components/layout/sidebar-toggle";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface DashboardTopBarProps {
  className?: string;
  navItems?: NavItem[];
  basePath?: string;
  accountLabel?: string;
  showCurrencyToggle?: boolean;
  userName?: string;
  userInitials?: string;
  profileHref?: string;
}

function DashboardTopBar({
  className,
  navItems,
  basePath,
  accountLabel,
  showCurrencyToggle = false,
  userName,
  userInitials,
  profileHref,
}: DashboardTopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-border/50 bg-background/60 px-4 backdrop-blur-sm md:px-6",
        className
      )}
    >
      <SidebarToggle />
      <DashboardBreadcrumbs
        className="hidden min-w-0 sm:block"
        navItems={navItems}
        basePath={basePath}
      />

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {showCurrencyToggle && <CurrencyToggle />}
        <DashboardTopBarActions
          accountLabel={accountLabel}
          userName={userName}
          userInitials={userInitials}
          profileHref={profileHref}
        />
      </div>
    </header>
  );
}

export { DashboardTopBar };
