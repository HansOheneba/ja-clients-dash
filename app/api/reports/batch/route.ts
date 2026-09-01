import { NextResponse } from "next/server";

import { createAndStoreReport } from "@/lib/reports/service";
import { getLatestPeriodForClient, listClients } from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";
import { REPORT_TEMPLATES } from "@/lib/wealth/wm-types";

export async function POST(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const clientIds = Array.isArray(body.clientIds)
    ? (body.clientIds as string[])
    : [];
  const templateKey = String(body.templateKey ?? "standard_monthly");
  const template = REPORT_TEMPLATES[templateKey];

  const targets =
    clientIds.length > 0
      ? clientIds
      : (await listClients(session.profile.advisor_id)).map((c) => c.id);

  const results: Array<{ clientId: string; ok: boolean; error?: string; reportId?: string }> = [];

  for (const clientId of targets) {
    try {
      const period = await getLatestPeriodForClient(clientId);
      if (!period) {
        results.push({ clientId, ok: false, error: "No statement period" });
        continue;
      }
      const kind = templateKey === "quarterly_deep_dive" ? "quarterly" : "monthly";
      const { report } = await createAndStoreReport(
        clientId,
        period.id,
        session.userId,
        kind,
      );
      results.push({ clientId, ok: true, reportId: report.id });
    } catch (err) {
      results.push({
        clientId,
        ok: false,
        error: err instanceof Error ? err.message : "Failed",
      });
    }
  }

  return NextResponse.json({ results, template: template?.label ?? templateKey });
}
