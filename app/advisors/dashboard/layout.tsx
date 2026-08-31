import { AdvisorShell } from "@/components/advisors/advisor-shell";
import { ADVISOR_ONBOARDING_PATH } from "@/lib/auth/dashboard-routes";
import { getAdvisorById } from "@/lib/wealth/queries";
import { requireAdvisor } from "@/lib/wealth/session";
import { redirect } from "next/navigation";

export default async function AdvisorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdvisor();

  if (session.profile.advisor_id) {
    const advisor = await getAdvisorById(session.profile.advisor_id);
    if (advisor && !advisor.onboarding_completed_at) {
      redirect(ADVISOR_ONBOARDING_PATH);
    }
  }

  return (
    <AdvisorShell
      userName={session.profile.full_name ?? "Wealth manager"}
      role={session.profile.role}
    >
      {children}
    </AdvisorShell>
  );
}
