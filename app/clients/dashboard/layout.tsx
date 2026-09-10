import { ClientDashboardLayoutClient } from "@/app/clients/dashboard/layout-client";
import { requireClient } from "@/lib/wealth/session";
import { getClientUnreadMessageCount } from "@/lib/wealth/wm-queries";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClient();
  const initialName = session.profile.full_name ?? "Client";
  const clientId = session.profile.client_id;
  const initialUnread =
    clientId != null ? await getClientUnreadMessageCount(clientId) : 0;

  return (
    <ClientDashboardLayoutClient initialName={initialName} initialUnread={initialUnread}>
      {children}
    </ClientDashboardLayoutClient>
  );
}
