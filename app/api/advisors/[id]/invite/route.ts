import { NextResponse } from "next/server";

import { inviteAdvisorToPortal } from "@/lib/wealth/advisor-service";
import { getAdvisorById } from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const advisor = await getAdvisorById(id);
  if (!advisor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await inviteAdvisorToPortal(id);
    return NextResponse.json({
      ok: true,
      authUserId: result.authUserId,
      message: `Invitation sent to ${advisor.email}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
