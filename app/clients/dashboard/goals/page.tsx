import { PageShell } from "@/components/layout/page-shell";
import { ClientGoalsView } from "@/components/clients/client-goals-view";
import { H1 } from "@/components/ui/typography";
import { requireClient } from "@/lib/wealth/session";
import { getClientGoals } from "@/lib/wealth/queries";
import { clientGoalToGoal } from "@/lib/wealth/goals";
import { redirect } from "next/navigation";

export default async function ClientGoalsPage() {
  const session = await requireClient();
  if (!session.profile.client_id) redirect("/clients/dashboard");

  const rows = await getClientGoals(session.profile.client_id);

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>My Goals</H1>
      </header>
      <ClientGoalsView goals={rows.map(clientGoalToGoal)} />
    </PageShell>
  );
}
