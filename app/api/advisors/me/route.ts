import { NextResponse } from "next/server";

import {
  isValidSchedule,
  parseAvailabilityNotes,
} from "@/lib/wealth/availability";
import {
  getAdvisorById,
  updateAdvisorFields,
  updateProfileFullNameForAdvisor,
} from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET() {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;
  if (!session.profile.advisor_id) {
    return NextResponse.json({ error: "No advisor profile" }, { status: 404 });
  }

  const advisor = await getAdvisorById(session.profile.advisor_id);
  if (!advisor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ advisor });
}

export async function PATCH(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;
  if (!session.profile.advisor_id) {
    return NextResponse.json({ error: "No advisor profile" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const advisorId = session.profile.advisor_id;

  const fullName =
    body.fullName !== undefined ? String(body.fullName).trim() : undefined;
  const phone = body.phone !== undefined ? String(body.phone).trim() : undefined;
  const bio = body.bio !== undefined ? String(body.bio).trim() : undefined;
  const timezone = body.timezone !== undefined ? String(body.timezone).trim() : undefined;
  const availabilityNotes =
    body.availabilityNotes !== undefined
      ? String(body.availabilityNotes).trim()
      : undefined;

  if (body.fullName !== undefined && !fullName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (availabilityNotes !== undefined) {
    const schedule = parseAvailabilityNotes(availabilityNotes);
    if (!schedule || !isValidSchedule(schedule)) {
      return NextResponse.json(
        { error: "Add at least one day with a valid time range." },
        { status: 400 },
      );
    }
  }

  if (body.completeOnboarding) {
    if (!phone || !bio || !timezone || !availabilityNotes) {
      return NextResponse.json(
        { error: "Phone, bio, timezone, and availability are required" },
        { status: 400 },
      );
    }
  }

  const advisor = await updateAdvisorFields(advisorId, {
    full_name: fullName,
    phone: phone ?? undefined,
    bio: bio ?? undefined,
    timezone: timezone ?? undefined,
    availability_notes: availabilityNotes ?? undefined,
    notify_sessions: body.notifySessions ? String(body.notifySessions) : undefined,
    notify_documents: body.notifyDocuments ? String(body.notifyDocuments) : undefined,
    notify_messages: body.notifyMessages ? String(body.notifyMessages) : undefined,
    title: body.completeOnboarding ? "Wealth Manager" : undefined,
    onboarding_completed_at: body.completeOnboarding ? new Date().toISOString() : undefined,
  });

  if (fullName) {
    await updateProfileFullNameForAdvisor(advisorId, fullName);
  }

  return NextResponse.json({ advisor });
}
