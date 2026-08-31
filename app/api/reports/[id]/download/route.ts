import { NextResponse } from "next/server";

import { generateInvestmentReportPdf } from "@/lib/reports/generate-pdf";
import { getReportDownloadUrl } from "@/lib/reports/service";
import { reportKindFromReference } from "@/lib/wealth/period-calendar";
import { getClientById, getReportById } from "@/lib/wealth/queries";
import { canAccessClient, getApiSession } from "@/lib/wealth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getApiSession();
    if (!session.ok) return session.response;

    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const client = await getClientById(report.client_id);
    if (!client || !canAccessClient(session.profile, client.id, client.advisor_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const signedUrl = await getReportDownloadUrl(report.storage_path);
      return NextResponse.redirect(signedUrl);
    } catch {
      const { buffer } = await generateInvestmentReportPdf(
        report.client_id,
        report.period_id,
        reportKindFromReference(report.reference),
      );
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${report.reference.replace(/\//g, "-")}.pdf"`,
        },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
