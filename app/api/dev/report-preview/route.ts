import { generateInvestmentReportPdf } from "@/lib/reports/generate-pdf";
import { isReportKind } from "@/lib/wealth/period-calendar";
import { JOHN_DOE_CLIENT_ID, JOHN_DOE_PERIOD_ID } from "@/lib/wealth/types";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "not available" }, { status: 404 });
  }

  const kindParam = new URL(request.url).searchParams.get("kind");
  const kind = isReportKind(kindParam) ? kindParam : "monthly";

  const { buffer, data } = await generateInvestmentReportPdf(
    JOHN_DOE_CLIENT_ID,
    JOHN_DOE_PERIOD_ID,
    kind,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "X-Report-Kind": data.reportKindTitle,
      "X-Report-Label": data.statementPeriodLabel,
      "X-Report-Reference": data.reference,
    },
  });
}
