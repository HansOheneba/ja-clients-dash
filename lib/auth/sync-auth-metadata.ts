import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/wealth/types";

/** Writes role into JWT app_metadata so the edge proxy skips a profiles lookup on every request. */
export async function syncAuthRoleMetadata(userId: string, role: UserRole) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  if (error) {
    console.warn("[syncAuthRoleMetadata]", userId, error.message);
  }
}
