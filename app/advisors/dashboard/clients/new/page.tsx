import { AddClientForm } from "@/components/advisors/add-client-form";
import { requireAdvisor } from "@/lib/wealth/session";

export default async function AddClientPage() {
  const session = await requireAdvisor();

  return (
    <AddClientForm defaultAdvisorId={session.profile.advisor_id} />
  );
}
