import { redirect } from "next/navigation";
import { dashboardHomeForRole, isAdvisorRole } from "@/lib/auth/dashboard-routes";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/wealth/queries";
import type { SessionProfile } from "@/lib/wealth/types";

export type AuthedSession = {
  userId: string;
  email: string;
  profile: SessionProfile;
};

export async function getSessionProfile(): Promise<{
  userId: string;
  email: string;
  profile: SessionProfile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileByUserId(user.id);
  return {
    userId: user.id,
    email: user.email ?? "",
    profile,
  };
}

export async function requireUser(): Promise<AuthedSession> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!session.profile) redirect("/login?error=account");
  return { userId: session.userId, email: session.email, profile: session.profile };
}

export async function requireClient() {
  const session = await requireUser();
  if (session.profile.role !== "client") {
    redirect(dashboardHomeForRole(session.profile.role));
  }
  return session;
}

export async function requireAdvisor() {
  const session = await requireUser();
  if (!isAdvisorRole(session.profile.role)) {
    redirect(dashboardHomeForRole(session.profile.role));
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== "admin") {
    redirect(dashboardHomeForRole(session.profile.role));
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (!session.profile.is_superadmin) {
    redirect("/advisors/dashboard");
  }
  return session;
}

export function canAccessClient(
  profile: SessionProfile,
  clientId: string,
  _clientAdvisorId?: string | null,
) {
  if (isAdvisorRole(profile.role)) return true;
  if (profile.role === "client") return profile.client_id === clientId;
  return false;
}

/** Advisors may only access private client workspace (messages, notes) for assigned clients. Admins retain full access. */
export function canMessageClient(
  profile: SessionProfile,
  clientAdvisorId: string | null | undefined,
) {
  if (profile.role === "admin") return true;
  if (!isAdvisorRole(profile.role)) return false;
  if (!profile.advisor_id) return true;
  return clientAdvisorId === profile.advisor_id;
}

/** Clients may message their advisor; advisors only for assigned clients; admins have full access. */
export function canParticipateInMessageThread(
  profile: SessionProfile,
  clientId: string,
  clientAdvisorId: string | null | undefined,
) {
  if (profile.role === "client") {
    return profile.client_id === clientId;
  }
  return canMessageClient(profile, clientAdvisorId);
}

export async function getApiSession() {
  const session = await getSessionProfile();
  if (!session?.profile) {
    return { ok: false as const, response: jsonError("Unauthorized", 401) };
  }
  return {
    ok: true as const,
    userId: session.userId,
    email: session.email,
    profile: session.profile,
  };
}

export async function getAdvisorApiSession() {
  const session = await getApiSession();
  if (!session.ok) return session;
  if (!isAdvisorRole(session.profile.role)) {
    return { ok: false as const, response: jsonError("Forbidden", 403) };
  }
  return session;
}

export async function getClientApiSession() {
  const session = await getApiSession();
  if (!session.ok) return session;
  const clientId = session.profile.client_id;
  if (session.profile.role !== "client" || !clientId) {
    return { ok: false as const, response: jsonError("Forbidden", 403) };
  }
  return {
    ok: true as const,
    userId: session.userId,
    email: session.email,
    profile: { ...session.profile, client_id: clientId },
  };
}

export async function getAdminApiSession() {
  const session = await getApiSession();
  if (!session.ok) return session;
  if (session.profile.role !== "admin") {
    return { ok: false as const, response: jsonError("Forbidden", 403) };
  }
  return session;
}

export async function getSuperAdminApiSession() {
  const session = await getAdminApiSession();
  if (!session.ok) return session;
  if (!session.profile.is_superadmin) {
    return { ok: false as const, response: jsonError("Forbidden", 403) };
  }
  return session;
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
