import { ClientDocumentsPageClient } from "@/app/clients/dashboard/documents/documents-client";
import { requireClient } from "@/lib/wealth/session";

export default async function ClientDocumentsPage() {
  const session = await requireClient();

  return (
    <ClientDocumentsPageClient clientId={session.profile.client_id ?? null} />
  );
}
