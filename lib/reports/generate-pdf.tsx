import { renderToBuffer } from "@react-pdf/renderer";

import { assembleInvestmentReportData } from "@/lib/reports/assemble-report-data";
import { registerReportFonts } from "@/lib/reports/pdf/report-fonts";
import { InvestmentReportDocument } from "@/lib/reports/pdf/investment-report-document";
import type { InvestmentReportData } from "@/lib/reports/types";
import type { ReportKind } from "@/lib/wealth/period-calendar";

export async function renderInvestmentReportPdf(
  data: InvestmentReportData,
): Promise<Buffer> {
  registerReportFonts();
  const buffer = await renderToBuffer(<InvestmentReportDocument data={data} />);
  return Buffer.from(buffer);
}

export async function generateInvestmentReportPdf(
  clientId: string,
  periodId: string,
  kind: ReportKind = "monthly",
): Promise<{ buffer: Buffer; data: InvestmentReportData }> {
  const data = await assembleInvestmentReportData(clientId, periodId, new Date(), kind);
  const buffer = await renderInvestmentReportPdf(data);
  return { buffer, data };
}
