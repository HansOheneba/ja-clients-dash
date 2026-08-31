import { NextResponse } from "next/server";

import { getApiSession } from "@/lib/wealth/session";
import { updateProfileNotifications } from "@/lib/wealth/queries";

export async function GET() {
  const session = await getApiSession();
  if (!session.ok) return session.response;

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    role: session.profile.role,
    clientId: session.profile.client_id,
    advisorId: session.profile.advisor_id,
    fullName: session.profile.full_name,
    isSuperadmin: session.profile.is_superadmin,
    emailNotifications: session.profile.email_notifications,
  });
}

export async function PATCH(request: Request) {
  const session = await getApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  if (typeof body.emailNotifications !== "boolean") {
    return NextResponse.json(
      { error: "emailNotifications must be a boolean" },
      { status: 400 },
    );
  }

  await updateProfileNotifications(session.userId, body.emailNotifications);

  return NextResponse.json({
    ok: true,
    emailNotifications: body.emailNotifications,
  });
}
