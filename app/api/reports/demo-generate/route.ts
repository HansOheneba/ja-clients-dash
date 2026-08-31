import { NextResponse } from "next/server";

import {
  assembleDemoInvestmentReport,
  type DemoSnapshotInput,
} from "@/lib/reports/assemble-demo-report";
import { renderInvestmentReportPdf } from "@/lib/reports/generate-pdf";
import { getUserProfile } from "@/lib/reports/service";
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

export async function GET(request: Request) {
  const auth = await requireSignedIn();
  if (auth.error) return auth.error;

  const clientId = new URL(request.url).searchParams.get("clientId") ?? "john-doe";
  try {
    const data = assembleDemoInvestmentReport(clientId);
    const buffer = await renderInvestmentReportPdf(data);
    return pdfResponse(buffer, data.reference);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate demo report";
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
    const data = assembleDemoInvestmentReport(clientId, snapshots);
    const buffer = await renderInvestmentReportPdf(data);
    return pdfResponse(buffer, data.reference);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate demo report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
