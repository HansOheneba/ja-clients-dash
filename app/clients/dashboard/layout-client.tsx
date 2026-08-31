"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CurrencyProvider } from "@/lib/currency-context";
import { clientNavItems } from "@/lib/client-navigation";

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
  const [name, setName] = useState(initialName);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.fullName) setName(data.fullName);
      })
      .catch(() => undefined);
  }, []);

  return (
    <CurrencyProvider>
      <DashboardShell
        navItems={clientNavItems}
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
