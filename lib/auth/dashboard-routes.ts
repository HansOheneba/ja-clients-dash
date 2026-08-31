import type { UserRole } from "@/lib/wealth/types";

export function dashboardHomeForRole(role: UserRole | string): string {
  if (role === "advisor" || role === "admin") {
    return "/advisors/dashboard";
  }
  return "/clients/dashboard";
}

export function isAdvisorRole(role: UserRole | string): boolean {
  return role === "advisor" || role === "admin";
}

export function isClientRole(role: UserRole | string): boolean {
  return role === "client";
}

export const ADVISOR_ONBOARDING_PATH = "/advisors/onboarding";

export function isSafeNextPath(path: string, role: UserRole | string): boolean {
  if (path.startsWith("/clients/dashboard") && isClientRole(role)) return true;
  if (path.startsWith("/advisors/dashboard") && isAdvisorRole(role)) return true;
  if (path === ADVISOR_ONBOARDING_PATH && isAdvisorRole(role)) return true;
  return false;
}
