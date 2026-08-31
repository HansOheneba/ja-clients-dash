import { NextResponse } from "next/server";

import { inviteAdvisorToPortal } from "@/lib/wealth/advisor-service";
import { createAdvisor, listAdvisorsWithStats } from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

/**
 * Advisors are readable by the whole advisory team so client detail pages can
 * show who manages an account. Any wealth manager may invite teammates.
 */
export async function GET() {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const advisors = await listAdvisorsWithStats();
  return NextResponse.json({ advisors });
}

export async function POST(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => null);
  const fullName = String(body?.fullName ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const wantsAdmin = body?.isAdmin === true;

  if (!fullName || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (wantsAdmin && !session.profile.is_superadmin) {
    return NextResponse.json(
      { error: "Only the platform superadmin can grant admin access" },
      { status: 403 },
    );
  }

  try {
    const advisor = await createAdvisor({
      fullName,
      email,
      title: body.title ? String(body.title) : null,
      phone: body.phone ? String(body.phone) : null,
      isAdmin: wantsAdmin,
    });

    let inviteError: string | null = null;
    if (body.sendInvite !== false) {
      try {
        await inviteAdvisorToPortal(advisor.id);
      } catch (err) {
        inviteError = err instanceof Error ? err.message : "Invite failed";
      }
    }

    return NextResponse.json({ advisor, inviteError });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add advisor";
    const conflict = message.includes("duplicate key");
    return NextResponse.json(
      { error: conflict ? "An advisor with that email already exists" : message },
      { status: conflict ? 409 : 400 },
    );
  }
}
