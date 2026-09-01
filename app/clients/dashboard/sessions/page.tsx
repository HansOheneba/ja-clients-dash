import { PageShell } from "@/components/layout/page-shell";
import { ClientSessionsView } from "@/components/clients/client-sessions-view";
import { H1, Muted } from "@/components/ui/typography";
import { requireUser } from "@/lib/wealth/session";
import { getAdvisorById, getClientById } from "@/lib/wealth/queries";
import { redirect } from "next/navigation";

export default async function ClientSessionsPage() {
  const session = await requireUser();
  if (session.profile.role !== "client" || !session.profile.client_id) {
    redirect(
      session.profile.role === "advisor" || session.profile.role === "admin"
        ? "/advisors/dashboard"
        : "/clients/dashboard",
    );
  }

  const client = await getClientById(session.profile.client_id);
  if (!client) redirect("/clients/dashboard");

  const advisor = client.advisor_id ? await getAdvisorById(client.advisor_id) : null;

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Sessions</H1>
        <Muted>
          Upcoming meetings, session requests, and recaps from your wealth manager.
        </Muted>
      </header>
      <ClientSessionsView advisorName={advisor?.full_name ?? "your wealth manager"} />
    </PageShell>
  );
}
