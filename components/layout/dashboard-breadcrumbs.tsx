"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { mainNavItems, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface DashboardBreadcrumbsProps {
  className?: string;
  navItems?: NavItem[];
  basePath?: string;
}

function DashboardBreadcrumbs({
  className,
  navItems = mainNavItems,
  basePath = "/dashboard",
}: DashboardBreadcrumbsProps) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname, navItems, basePath);

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-body-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              {isLast ? (
                <span className="truncate font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  prefetch={false}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { DashboardBreadcrumbs };
