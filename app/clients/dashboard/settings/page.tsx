import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { NotificationPreferences } from "@/components/settings/notification-preferences";
import { buttonVariants } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { requireUser } from "@/lib/wealth/session";
import { cn } from "@/lib/utils";

function roleLabel(role: string, isSuperadmin: boolean) {
  if (isSuperadmin) return "Platform superadmin";
  if (role === "admin") return "Admin wealth manager";
  if (role === "advisor") return "Wealth manager";
  return "Client";
}

export default async function ClientSettingsPage() {
  const session = await requireUser();

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Settings</H1>
        <Muted>Account and notification preferences</Muted>
      </header>

      <div className="grid grid-cols-1 gap-(--spacing-grid) lg:grid-cols-2">
        <DashCard>
          <DashCardHeader>
            <DashCardTitle>Account</DashCardTitle>
            <DashCardDescription>How you sign in to JA Wealth</DashCardDescription>
          </DashCardHeader>
          <DashCardContent className="flex flex-col gap-3">
            <div className="flex justify-between gap-4">
              <Muted>Name</Muted>
              <TextSmall className="font-medium">{session.profile.full_name ?? "Not set"}</TextSmall>
            </div>
            <div className="flex justify-between gap-4">
              <Muted>Email</Muted>
              <TextSmall className="font-medium">{session.email}</TextSmall>
            </div>
            <div className="flex justify-between gap-4">
              <Muted>Role</Muted>
              <TextSmall className="font-medium">
                {roleLabel(session.profile.role, session.profile.is_superadmin)}
              </TextSmall>
            </div>
            {session.profile.role === "client" ? (
              <Link
                href="/clients/dashboard/profile"
                prefetch={false}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2 w-fit")}
              >
                View full profile
              </Link>
            ) : null}
          </DashCardContent>
        </DashCard>

        <DashCard>
          <DashCardHeader>
            <DashCardTitle>Notifications</DashCardTitle>
            <DashCardDescription>Choose how we reach you outside the portal</DashCardDescription>
          </DashCardHeader>
          <DashCardContent>
            <NotificationPreferences
              initialEnabled={session.profile.email_notifications}
              description="Receive emails when your wealth manager publishes reports or posts portfolio updates."
            />
          </DashCardContent>
        </DashCard>
      </div>
    </PageShell>
  );
}
