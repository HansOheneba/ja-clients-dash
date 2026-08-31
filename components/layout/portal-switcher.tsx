"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appConfig } from "@/lib/app-config";
import { cn } from "@/lib/utils";

function PortalSwitcher() {
  const pathname = usePathname();
  const isAdvisor = pathname.startsWith("/advisors/");

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/60 p-0.5">
      <Link
        href={appConfig.routes.client.dashboard}
        className={cn(
          "rounded-md px-3 py-1 text-xs font-medium transition-colors",
          !isAdvisor
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Client
      </Link>
      <Link
        href={appConfig.routes.advisor.dashboard}
        className={cn(
          "rounded-md px-3 py-1 text-xs font-medium transition-colors",
          isAdvisor
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Wealth manager
      </Link>
    </div>
  );
}

export { PortalSwitcher };
