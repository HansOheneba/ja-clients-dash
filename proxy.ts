import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADVISOR_ONBOARDING_PATH,
  dashboardHomeForRole,
  isAdvisorRole,
  isClientRole,
  isSafeNextPath,
} from "@/lib/auth/dashboard-routes";
import { assertSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

const CLIENT_PREFIX = "/clients/dashboard";
const ADVISOR_PREFIX = "/advisors/dashboard";
const PROTECTED_PREFIXES = [CLIENT_PREFIX, ADVISOR_PREFIX, ADVISOR_ONBOARDING_PATH];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    assertSupabaseEnv();
  } catch {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: "wealth" },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
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
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "client";
    const home = dashboardHomeForRole(role);

    if (isLogin) {
      const next = request.nextUrl.searchParams.get("next");
      const url = request.nextUrl.clone();
      url.pathname = next && isSafeNextPath(next, role) ? next : home;
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith(CLIENT_PREFIX) && !isClientRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    if (
      (pathname.startsWith(ADVISOR_PREFIX) || pathname.startsWith(ADVISOR_ONBOARDING_PATH)) &&
      !isAdvisorRole(role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return response;
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
