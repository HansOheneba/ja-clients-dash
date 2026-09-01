import { PageShell } from "@/components/layout/page-shell";
import { ClientAdvisorCard } from "@/components/clients/client-advisor-card";
import { H1, Muted } from "@/components/ui/typography";
import { requireUser } from "@/lib/wealth/session";
import { getAdvisorById, getClientById } from "@/lib/wealth/queries";
import { redirect } from "next/navigation";

export default async function ClientAdvisorPage() {
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
    <PageShell className="flex max-w-2xl flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Your Advisor</H1>
        <Muted>Contact details and availability for your wealth manager.</Muted>
      </header>
      <ClientAdvisorCard advisor={advisor} />
    </PageShell>
  );
}
