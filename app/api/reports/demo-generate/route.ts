import { NextResponse } from "next/server";

import {
  assembleDemoInvestmentReport,
  type DemoSnapshotInput,
} from "@/lib/reports/assemble-demo-report";
import { generateInvestmentReportPdf } from "@/lib/reports/generate-pdf";
import { resolveReportClientId } from "@/lib/reports/resolve-report-client";
import { getUserProfile } from "@/lib/reports/service";
import { ALL_BUCKETS } from "@/lib/wealth/constants";
import {
  getLatestPeriodForClient,
  getStatementPeriod,
  upsertSnapshots,
} from "@/lib/wealth/queries";
import { createClient } from "@/lib/supabase/server";

async function requireSignedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const profile = await getUserProfile(user.id);
  if (!profile) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { user };
}

function pdfResponse(buffer: Buffer, reference: string) {
  const fileName = `${reference.replace(/\//g, "-")}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

async function upsertDraftSnapshots(
  clientId: string,
  periodId: string,
  snapshots: DemoSnapshotInput[],
) {
  const byBucket = new Map(snapshots.map((row) => [row.bucket, row]));
  const rows = ALL_BUCKETS.map((bucket) => {
    const snap = byBucket.get(bucket);
    const previous = Number(snap?.previous_value_usd ?? 0);
    const current = Number(snap?.current_value_usd ?? 0);
    const changePct =
      snap?.period_change_pct ??
      (bucket === "coa" || previous === 0 ? null : ((current - previous) / previous) * 100);
    return {
      bucket,
      previous_value_usd: previous,
      current_value_usd: current,
      period_change_pct: changePct,
      ytd_pct: snap?.ytd_pct ?? changePct,
      inception_gain_usd: snap?.inception_gain_usd ?? (current - previous),
      inception_pct: snap?.inception_pct ?? changePct,
      annualized_return_pct: snap?.annualized_return_pct ?? changePct,
    };
  });
  await upsertSnapshots(clientId, periodId, rows);
}

async function generateFromDatabase(
  slugOrId: string,
  options?: { periodId?: string; snapshots?: DemoSnapshotInput[] },
) {
  const clientId = await resolveReportClientId(slugOrId);
  if (!clientId) throw new Error("Client not found");

  const period = options?.periodId
    ? await getStatementPeriod(options.periodId)
    : await getLatestPeriodForClient(clientId);
  if (!period || period.client_id !== clientId) {
    throw new Error("No statement period for this client");
  }

  if (options?.snapshots) {
    await upsertDraftSnapshots(clientId, period.id, options.snapshots);
  }

  return generateInvestmentReportPdf(clientId, period.id);
}

export async function GET(request: Request) {
  const auth = await requireSignedIn();
  if (auth.error) return auth.error;

  const clientId = new URL(request.url).searchParams.get("clientId") ?? "john-doe";
  try {
    const dbClientId = await resolveReportClientId(clientId);
    if (dbClientId) {
      const { buffer, data } = await generateFromDatabase(clientId);
      return pdfResponse(buffer, data.reference);
    }

    const data = assembleDemoInvestmentReport(clientId);
    const { renderInvestmentReportPdf } = await import("@/lib/reports/generate-pdf");
    const buffer = await renderInvestmentReportPdf(data);
    return pdfResponse(buffer, data.reference);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const auth = await requireSignedIn();
  if (auth.error) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    const clientId = (body.clientId as string | undefined) ?? "john-doe";
    const snapshots = body.snapshots as DemoSnapshotInput[] | undefined;
    const periodId = body.periodId as string | undefined;

    const dbClientId = await resolveReportClientId(clientId);
    if (dbClientId) {
      const { buffer, data } = await generateFromDatabase(clientId, { periodId, snapshots });
      return pdfResponse(buffer, data.reference);
    }

    const data = assembleDemoInvestmentReport(clientId, snapshots);
    const { renderInvestmentReportPdf } = await import("@/lib/reports/generate-pdf");
    const buffer = await renderInvestmentReportPdf(data);
    return pdfResponse(buffer, data.reference);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
