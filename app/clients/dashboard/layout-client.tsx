"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CurrencyProvider } from "@/lib/currency-context";
import { clientNavItems } from "@/lib/client-navigation";
import type { NavItem } from "@/lib/navigation";

const UNREAD_POLL_MS = 60_000;

function initialsFrom(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClientDashboardLayoutClient({
  initialName,
  children,
}: {
  initialName: string;
  children: React.ReactNode;
}) {
  const [name] = useState(initialName);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (document.visibilityState === "hidden") return;

    try {
      const res = await fetch("/api/client/unread", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) return;
      if (!res.ok) return;
      const data = await res.json();
      setUnreadMessages(data.unreadMessages ?? 0);
    } catch {
      /* ignore transient network errors */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();

    const interval = window.setInterval(() => {
      void refreshUnread();
    }, UNREAD_POLL_MS);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshUnread();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshUnread]);

  const navItems: NavItem[] = useMemo(
    () =>
      clientNavItems.map((item) =>
        item.href.endsWith("/messages") && unreadMessages > 0
          ? { ...item, badge: unreadMessages }
          : item,
      ),
    [unreadMessages],
  );

  return (
    <CurrencyProvider>
      <DashboardShell
        navItems={navItems}
        basePath="/clients/dashboard"
        accountLabel="Client account"
        showCurrencyToggle
        userName={name}
        userInitials={initialsFrom(name)}
        profileHref="/clients/dashboard/settings"
      >
        {children}
      </DashboardShell>
    </CurrencyProvider>
  );
}
