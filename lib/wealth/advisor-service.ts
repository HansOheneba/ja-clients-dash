import { sendAdvisorPortalInviteEmail } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { queryDb } from "@/lib/supabase/db";
import { appOrigin } from "@/lib/wealth/client-service";
import {
  findAuthUserIdByEmail,
  getAdvisorById,
} from "@/lib/wealth/queries";

export async function inviteAdvisorToPortal(advisorId: string) {
  const advisor = await getAdvisorById(advisorId);
  if (!advisor) throw new Error("Advisor not found");
  if (!advisor.is_active) {
    throw new Error("Reactivate this account before sending an invite");
  }

  const admin = createAdminClient();
  let authUserId =
    advisor.auth_user_id ?? (await findAuthUserIdByEmail(advisor.email));

  if (!authUserId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: advisor.email,
      email_confirm: true,
      app_metadata: { role: advisor.is_admin ? "admin" : "advisor" },
      user_metadata: { full_name: advisor.full_name },
    });
    if (error) throw error;
    authUserId = data.user?.id ?? null;
  }

  if (!authUserId) {
    throw new Error("Could not create auth account for this advisor");
  }

  const profileRole = advisor.is_admin ? "admin" : "advisor";

  await queryDb(
    `UPDATE wealth.advisors
     SET auth_user_id = $2, invited_at = now()
     WHERE id = $1`,
    [advisor.id, authUserId],
  );

  await queryDb(
    `INSERT INTO wealth.profiles (id, role, advisor_id, full_name)
     VALUES ($1, $2::wealth.user_role, $3, $4)
     ON CONFLICT (id) DO UPDATE SET
       role = EXCLUDED.role::wealth.user_role,
       advisor_id = EXCLUDED.advisor_id,
       full_name = COALESCE(EXCLUDED.full_name, wealth.profiles.full_name)`,
    [authUserId, profileRole, advisor.id, advisor.full_name],
  );

  const loginUrl = `${appOrigin()}/login?next=${encodeURIComponent("/advisors/onboarding")}`;
  await sendAdvisorPortalInviteEmail({
    to: advisor.email,
    advisorName: advisor.full_name,
    loginUrl,
    isAdmin: advisor.is_admin,
  });

  return { authUserId };
}
