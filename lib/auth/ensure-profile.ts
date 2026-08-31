import { queryDb } from "@/lib/supabase/db";

type AdvisorRow = {
  id: string;
  full_name: string;
  is_admin: boolean;
  is_superadmin: boolean;
  is_active: boolean;
};
type ClientRow = { id: string; full_name: string };
type ProfileRow = { id: string; role: string };

/** Thrown when a deactivated advisor tries to sign in and has no client record. */
export class AdvisorAccessRevokedError extends Error {
  constructor() {
    super("Your access has been removed. Contact your JA Wealth administrator.");
    this.name = "AdvisorAccessRevokedError";
  }
}

export async function ensureWealthProfile(userId: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const advisors = await queryDb<AdvisorRow>(
    `SELECT id, full_name, is_admin, is_superadmin, is_active FROM wealth.advisors
     WHERE lower(email) = $1 LIMIT 1`,
    [normalizedEmail],
  );
  const advisorRecord = advisors[0];

  const clients = await queryDb<ClientRow>(
    `SELECT id, full_name FROM wealth.clients WHERE lower(email) = $1 LIMIT 1`,
    [normalizedEmail],
  );
  const client = clients[0];

  if (advisorRecord && !advisorRecord.is_active && !client) {
    throw new AdvisorAccessRevokedError();
  }

  // A deactivated advisor keeps no advisor role or advisor link.
  const advisor = advisorRecord?.is_active ? advisorRecord : undefined;

  const role = advisor ? (advisor.is_admin ? "admin" : "advisor") : "client";
  const fullName =
    advisor?.full_name ?? client?.full_name ?? normalizedEmail.split("@")[0];

  if (advisor) {
    await queryDb(
      `UPDATE wealth.advisors SET auth_user_id = $1 WHERE id = $2`,
      [userId, advisor.id],
    );
  }

  if (client) {
    await queryDb(
      `UPDATE wealth.clients SET auth_user_id = $1, last_login_at = now() WHERE id = $2`,
      [userId, client.id],
    );
  }

  await queryDb(
    `INSERT INTO wealth.profiles (id, role, client_id, advisor_id, full_name)
     VALUES ($1, $2::wealth.user_role, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       role = EXCLUDED.role::wealth.user_role,
       advisor_id = EXCLUDED.advisor_id,
       client_id = COALESCE(EXCLUDED.client_id, wealth.profiles.client_id),
       full_name = COALESCE(EXCLUDED.full_name, wealth.profiles.full_name)`,
    [userId, role, client?.id ?? null, advisor?.id ?? null, fullName],
  );

  const profile = await queryDb<ProfileRow>(
    `SELECT id, role::text FROM wealth.profiles WHERE id = $1`,
    [userId],
  );

  return profile[0] ?? { id: userId, role };
}
