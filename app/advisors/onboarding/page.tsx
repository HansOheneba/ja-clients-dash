import Image from "next/image";

import { WealthManagerOnboardingForm } from "@/components/advisors/wealth-manager-onboarding-form";
import { H1, Lead } from "@/components/ui/typography";
import { getAdvisorById } from "@/lib/wealth/queries";
import { requireAdvisor } from "@/lib/wealth/session";
import { redirect } from "next/navigation";

export default async function AdvisorOnboardingPage() {
  const session = await requireAdvisor();
  if (!session.profile.advisor_id) {
    redirect("/advisors/dashboard");
  }

  const advisor = await getAdvisorById(session.profile.advisor_id);
  if (!advisor) redirect("/advisors/dashboard");
  if (advisor.onboarding_completed_at) {
    redirect("/advisors/dashboard");
  }

  return (
    <div
      className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
      style={{
        background:
          "linear-gradient(165deg, #f8f8f7 0%, #f4f5f7 45%, #f0f2f6 100%)",
      }}
    >
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/logos/JA_Wealth_blk.png"
            alt="JA Wealth"
            width={132}
            height={23}
            className="h-6 w-auto object-contain"
            priority
          />
          <div className="flex flex-col gap-2">
            <H1>Welcome, {advisor.full_name.split(" ")[0]}</H1>
            <Lead>
              Complete your wealth manager profile so clients know who you are and when they
              can request a session with you.
            </Lead>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 md:p-8">
          <WealthManagerOnboardingForm
            defaultPhone={advisor.phone}
            defaultTimezone={advisor.timezone}
            defaultAvailabilityNotes={advisor.availability_notes}
          />
        </div>
      </div>
    </div>
  );
}
