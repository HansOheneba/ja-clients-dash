"use client";

import { createContext, useContext } from "react";

type ClientDashboardContextValue = {
  clientName: string;
};

const ClientDashboardContext = createContext<ClientDashboardContextValue>({
  clientName: "Client",
});

export function ClientDashboardProvider({
  clientName,
  children,
}: {
  clientName: string;
  children: React.ReactNode;
}) {
  return (
    <ClientDashboardContext.Provider value={{ clientName }}>
      {children}
    </ClientDashboardContext.Provider>
  );
}

export function useClientDashboard() {
  return useContext(ClientDashboardContext);
}
