import { ClientMessagesPageClient } from "@/app/clients/dashboard/messages/messages-client";
import { requireClient } from "@/lib/wealth/session";

export default async function ClientMessagesPage() {
  const session = await requireClient();

  return (
    <ClientMessagesPageClient clientId={session.profile.client_id ?? null} />
  );
}
