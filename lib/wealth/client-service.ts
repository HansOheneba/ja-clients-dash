import { queryDb } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendClientUpdateEmail,
  sendPortalInviteEmail,
} from "@/lib/email/resend";
import {
  findAuthUserIdByEmail,
  getClientByEmail,
  getClientById,
  insertClientUpdate,
  insertStatementPeriod,
  upsertClientAddress,
  upsertHistoryPoint,
  upsertSnapshots,
} from "@/lib/wealth/queries";
import { ALL_BUCKETS } from "@/lib/wealth/constants";
import { calendarMonthBounds } from "@/lib/wealth/period-calendar";
import { clientNumberFromId, isUniqueViolation } from "@/lib/wealth/references";
import { randomUUID } from "node:crypto";
import type {
  ClientAddress,
  ClientStatus,
  PortfolioBucket,
  UpdateKind,
  WealthClient,
} from "@/lib/wealth/types";

export function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export type CreateClientInput = {
  fullName: string;
  email: string;
  phone?: string;
  currency?: string;
  inceptionDate?: string;
  status?: ClientStatus;
  riskProfile?: string;
  investmentHorizon?: string;
  primaryObjective?: string;
  advisorNotes?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  dependents?: number;
  estateStatus?: string;
  financialGoals?: string;
  address?: Partial<ClientAddress>;
  buckets?: Partial<Record<PortfolioBucket, { previous: number; current: number }>>;
  sendInvite?: boolean;
  createdBy?: string | null;
  advisorId?: string | null;
};

export async function createWealthClient(input: CreateClientInput) {
  const email = input.email.trim().toLowerCase();
  const existing = await getClientByEmail(email);
  if (existing) {
    throw new Error("A client with this email already exists.");
  }

  let client: WealthClient | undefined;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = randomUUID();
    const clientNumber = clientNumberFromId(id);
    try {
      const rows = await queryDb<WealthClient>(
        `INSERT INTO wealth.clients (
          id, client_number, full_name, email, phone, currency, inception_date,
          advisor_id, status, risk_profile, investment_horizon, primary_objective,
          advisor_notes, date_of_birth, marital_status, dependents, estate_status,
          financial_goals, reference_code
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7::date, $8, $9::wealth.client_status, $10, $11, $12,
          $13, $14::date, $15, COALESCE($16::integer, 0), $17, $18, $2
        )
        RETURNING id, client_number, reference_code, full_name, email, phone, currency,
                  inception_date::text, advisor_id, status::text, risk_profile,
                  investment_horizon, primary_objective, marital_status, dependents,
                  estate_status, financial_goals, advisor_notes, date_of_birth::text,
                  auth_user_id, invited_at::text, last_login_at::text, created_at::text`,
        [
          id,
          clientNumber,
          input.fullName.trim(),
          email,
          input.phone?.trim() || null,
          input.currency ?? "USD",
          input.inceptionDate || null,
          input.advisorId ?? null,
          input.status ?? "onboarding",
          input.riskProfile || null,
          input.investmentHorizon || null,
          input.primaryObjective || null,
          input.advisorNotes || null,
          input.dateOfBirth || null,
          input.maritalStatus || null,
          input.dependents ?? 0,
          input.estateStatus || null,
          input.financialGoals || null,
        ],
      );
      client = rows[0];
      break;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 7) throw error;
      const constraint =
        typeof error === "object" && error && "constraint" in error
          ? String((error as { constraint?: string }).constraint ?? "")
          : "";
      if (constraint.includes("email")) throw error;
    }
  }
  if (!client) throw new Error("Could not create client");

  const address = input.address;
  if (address?.line1 && address.city) {
    await upsertClientAddress(client.id, {
      line1: address.line1,
      line2: address.line2 ?? null,
      city: address.city,
      region: address.region ?? null,
      postal_code: address.postal_code ?? null,
      country: address.country ?? "US",
    });
  }

  const month = calendarMonthBounds(new Date().getFullYear(), new Date().getMonth());
  const period = await insertStatementPeriod({
    clientId: client.id,
    periodStart: month.start,
    periodEnd: month.end,
    label: month.label,
  });

  const snapshots = ALL_BUCKETS.map((bucket) => {
    const values = input.buckets?.[bucket];
    const current = Number(values?.current ?? 0);
    const previous = Number(values?.previous ?? current);
    const changePct =
      bucket === "coa" || previous === 0
        ? null
        : ((current - previous) / previous) * 100;
    return {
      bucket,
      previous_value_usd: previous,
      current_value_usd: current,
      period_change_pct: changePct,
      ytd_pct: changePct,
      inception_gain_usd: current - previous,
      inception_pct: changePct,
      annualized_return_pct: changePct,
    };
  });
  await upsertSnapshots(client.id, period.id, snapshots);

  const total = snapshots.reduce((sum, s) => sum + s.current_value_usd, 0);
  await upsertHistoryPoint(client.id, month.end, total);

  let inviteError: string | null = null;
  if (input.sendInvite !== false) {
    try {
      await inviteClientToPortal(client.id, input.createdBy ?? null);
    } catch (err) {
      inviteError = err instanceof Error ? err.message : "Invite failed";
    }
  }

  return { client, period, inviteError };
}

export async function inviteClientToPortal(clientId: string, createdBy?: string | null) {
  const client = await getClientById(clientId);
  if (!client) throw new Error("Client not found");

  const admin = createAdminClient();
  let authUserId = client.auth_user_id ?? (await findAuthUserIdByEmail(client.email));

  if (!authUserId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: client.email,
      email_confirm: true,
      app_metadata: { role: "client" },
      user_metadata: { full_name: client.full_name },
    });
    if (error) throw error;
    authUserId = data.user?.id ?? null;
  }

  if (authUserId) {
    await queryDb(
      `UPDATE wealth.clients
       SET auth_user_id = $2, invited_at = now(), status = CASE
         WHEN status = 'onboarding' THEN status
         ELSE status
       END
       WHERE id = $1`,
      [client.id, authUserId],
    );
    await queryDb(
      `INSERT INTO wealth.profiles (id, role, client_id, full_name)
       VALUES ($1, 'client', $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         role = 'client',
         client_id = EXCLUDED.client_id,
         full_name = COALESCE(EXCLUDED.full_name, wealth.profiles.full_name)`,
      [authUserId, client.id, client.full_name],
    );
  }

  const loginUrl = `${appOrigin()}/login`;
  await sendPortalInviteEmail({
    to: client.email,
    clientName: client.full_name,
    clientNumber: client.client_number,
    loginUrl,
  });

  await insertClientUpdate({
    clientId: client.id,
    kind: "invite",
    title: "Portal invitation sent",
    body: "Your JA Wealth client portal is ready. Sign in with your email to view your portfolio and reports.",
    createdBy,
  });

  return { authUserId };
}

export async function notifyClient(params: {
  clientId: string;
  kind: UpdateKind;
  title: string;
  body: string;
  createdBy?: string | null;
  email?: boolean;
}) {
  await insertClientUpdate({
    clientId: params.clientId,
    kind: params.kind,
    title: params.title,
    body: params.body,
    createdBy: params.createdBy,
  });

  if (!params.email) return;

  const client = await getClientById(params.clientId);
  if (!client) return;

  const profileRows = await queryDb<{ email_notifications: boolean }>(
    `SELECT COALESCE(email_notifications, true) AS email_notifications
     FROM wealth.profiles
     WHERE client_id = $1
     LIMIT 1`,
    [params.clientId],
  );
  if (profileRows[0] && !profileRows[0].email_notifications) return;

  try {
    await sendClientUpdateEmail({
      to: client.email,
      clientName: client.full_name,
      title: params.title,
      body: params.body,
      loginUrl: `${appOrigin()}/clients/dashboard`,
    });
  } catch {
    /* email is best-effort; the in-portal update still lands */
  }
}
