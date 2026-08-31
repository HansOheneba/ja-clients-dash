import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const { generateInvestmentReportPdf } = await import("../lib/reports/generate-pdf.tsx");
const { JOHN_DOE_CLIENT_ID, JOHN_DOE_PERIOD_ID } = await import("../lib/wealth/types.ts");

try {
  const { buffer, data } = await generateInvestmentReportPdf(
    JOHN_DOE_CLIENT_ID,
    JOHN_DOE_PERIOD_ID,
  );
  console.log("PDF generated:", {
    bytes: buffer.length,
    client: data.clientName,
    total: data.totalPortfolioValueUsd,
    reference: data.reference,
    sections: {
      overview: data.overviewRows.length,
      performance: data.performanceRows.length,
      transactions: data.transactions.length,
    },
  });
} catch (err) {
  console.error("Failed:", err);
  process.exit(1);
}
