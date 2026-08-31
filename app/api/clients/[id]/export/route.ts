import { NextResponse } from "next/server";

import { assembleInvestmentReportData } from "@/lib/reports/assemble-report-data";
import { getJaPortfolioForClient } from "@/lib/api/domain/wealth-portfolio";
import {
  getClientById,
  getLatestPeriodForClient,
  getTransactionsForClient,
} from "@/lib/wealth/queries";
import { canAccessClient, getApiSession } from "@/lib/wealth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getApiSession();
  if (!session.ok) return session.response;
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const period = await getLatestPeriodForClient(id);
  const [portfolio, transactions, report] = await Promise.all([
    getJaPortfolioForClient(id),
    getTransactionsForClient(id, 200),
    period ? assembleInvestmentReportData(id, period.id) : null,
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    client: {
      name: client.full_name,
      clientNumber: client.client_number,
      email: client.email,
      currency: client.currency,
    },
    portfolio,
    transactions,
    statement: report,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${client.client_number}-portfolio.json"`,
    },
  });
}
