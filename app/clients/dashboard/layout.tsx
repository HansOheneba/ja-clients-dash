import { ClientDashboardLayoutClient } from "@/app/clients/dashboard/layout-client";
import { requireClient } from "@/lib/wealth/session";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClient();
  const initialName = session.profile.full_name ?? "Client";

  return (
    <ClientDashboardLayoutClient initialName={initialName}>
      {children}
    </ClientDashboardLayoutClient>
  );
}
