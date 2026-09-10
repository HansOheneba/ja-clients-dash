import { ClientDashboardHome } from "@/app/clients/dashboard/client-dashboard-home";
import { getClientOverviewData } from "@/lib/wealth/client-overview";
import { requireClient } from "@/lib/wealth/session";

export default async function ClientDashboardPage() {
  const session = await requireClient();
  const clientId = session.profile.client_id;
  const clientName = session.profile.full_name ?? "Client";

  const overview =
    clientId != null ? await getClientOverviewData(clientId) : null;

  return <ClientDashboardHome overview={overview} clientName={clientName} />;
}
