import { NextResponse } from "next/server";

import {
  countActiveAdmins,
  countClientsForAdvisor,
  getAdvisorById,
  reassignAdvisorClients,
  updateAdvisorFields,
} from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const existing = await getAdvisorById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const callerIsSuperAdmin = session.profile.is_superadmin;

  if (existing.is_superadmin && !callerIsSuperAdmin) {
    return NextResponse.json(
      { error: "Only the platform superadmin can change this account" },
      { status: 403 },
    );
  }

  if (typeof body.isAdmin === "boolean" && body.isAdmin !== existing.is_admin && !callerIsSuperAdmin) {
    return NextResponse.json(
      { error: "Only the platform superadmin can grant or remove admin access" },
      { status: 403 },
    );
  }

  const deactivating = body.isActive === false && existing.is_active;
  const losingAdmin =
    existing.is_admin && (body.isAdmin === false || body.isActive === false);

  if (existing.is_superadmin && deactivating) {
    return NextResponse.json(
      { error: "The platform superadmin account cannot be deactivated" },
      { status: 403 },
    );
  }

  if (losingAdmin && (await countActiveAdmins(id)) === 0) {
    return NextResponse.json(
      { error: "There must be at least one active admin" },
      { status: 409 },
    );
  }

  if (deactivating && id === session.profile.advisor_id) {
    return NextResponse.json(
      { error: "You cannot deactivate your own account" },
      { status: 400 },
    );
  }

  if (deactivating) {
    const clientCount = await countClientsForAdvisor(id);
    if (clientCount > 0) {
      const reassignTo = body.reassignToAdvisorId
        ? String(body.reassignToAdvisorId)
        : null;

      if (!reassignTo) {
        return NextResponse.json(
          {
            error: `${existing.full_name} still manages ${clientCount} client${
              clientCount === 1 ? "" : "s"
            }. Choose an advisor to take them over first.`,
            clientCount,
          },
          { status: 409 },
        );
      }

      if (reassignTo === id) {
        return NextResponse.json(
          { error: "Choose a different advisor to take over the clients" },
          { status: 400 },
        );
      }

      const target = await getAdvisorById(reassignTo);
      if (!target || !target.is_active) {
        return NextResponse.json(
          { error: "The receiving advisor must be active" },
          { status: 400 },
        );
      }

      await reassignAdvisorClients(id, reassignTo);
    }
  }

  const advisor = await updateAdvisorFields(id, {
    full_name: body.fullName ? String(body.fullName) : undefined,
    email: body.email ? String(body.email) : undefined,
    title: body.title === undefined ? undefined : body.title || null,
    phone: body.phone === undefined ? undefined : body.phone || null,
    is_admin:
      body.isActive === false
        ? false
        : typeof body.isAdmin === "boolean"
          ? body.isAdmin
          : undefined,
    is_active: typeof body.isActive === "boolean" ? body.isActive : undefined,
  });

  return NextResponse.json({ advisor });
}
