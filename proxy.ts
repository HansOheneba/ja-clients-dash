import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADVISOR_ONBOARDING_PATH,
  dashboardHomeForRole,
  isAdvisorRole,
  isClientRole,
  isSafeNextPath,
} from "@/lib/auth/dashboard-routes";
import type { UserRole } from "@/lib/wealth/types";
import { assertSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

const CLIENT_PREFIX = "/clients/dashboard";
const ADVISOR_PREFIX = "/advisors/dashboard";
const PROTECTED_PREFIXES = [CLIENT_PREFIX, ADVISOR_PREFIX, ADVISOR_ONBOARDING_PATH];

function withSupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options);
  });
  return to;
}

function redirectWithSession(request: NextRequest, url: URL, sessionResponse: NextResponse) {
  return withSupabaseCookies(sessionResponse, NextResponse.redirect(url));
}

function roleFromAppMetadata(user: User): UserRole | null {
  const role = user.app_metadata?.role;
  if (role === "admin" || role === "advisor" || role === "client") return role;
  return null;
}

async function resolveUserRole(
  supabase: ReturnType<typeof createServerClient>,
  user: User,
  pathname: string,
): Promise<UserRole> {
  const fromMetadata = roleFromAppMetadata(user);
  if (fromMetadata) return fromMetadata;

  // Only hit the database when role is missing from JWT metadata (legacy sessions).
  const needsRole =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith(CLIENT_PREFIX) ||
    pathname.startsWith(ADVISOR_PREFIX) ||
    pathname.startsWith(ADVISOR_ONBOARDING_PATH);

  if (!needsRole) return "client";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (profile?.role as UserRole | undefined) ?? "client";
}

export async function proxy(request: NextRequest) {
  let sessionResponse = NextResponse.next({ request });

  try {
    assertSupabaseEnv();
  } catch {
    return sessionResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: "wealth" },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        sessionResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          sessionResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return redirectWithSession(request, url, sessionResponse);
  }

  if (user) {
    const role = await resolveUserRole(supabase, user, pathname);
    const home = dashboardHomeForRole(role);
    const signedOut = request.nextUrl.searchParams.get("signedOut") === "1";
    const hasAuthError = request.nextUrl.searchParams.has("error");

    if (isLogin && !signedOut && !hasAuthError) {
      const next = request.nextUrl.searchParams.get("next");
      const url = request.nextUrl.clone();
      url.pathname = next && isSafeNextPath(next, role) ? next : home;
      url.search = "";
      return redirectWithSession(request, url, sessionResponse);
    }

    if (pathname.startsWith(CLIENT_PREFIX) && !isClientRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return redirectWithSession(request, url, sessionResponse);
    }

    if (
      (pathname.startsWith(ADVISOR_PREFIX) || pathname.startsWith(ADVISOR_ONBOARDING_PATH)) &&
      !isAdvisorRole(role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return redirectWithSession(request, url, sessionResponse);
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/clients/dashboard/:path*",
    "/advisors/dashboard/:path*",
    "/advisors/onboarding",
    "/login",
    "/login/verify",
  ],
};
