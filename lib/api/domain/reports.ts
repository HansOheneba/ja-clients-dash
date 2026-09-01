import { getReportsForClient } from "@/lib/wealth/queries";
import type { WealthReport } from "@/lib/wealth/types";

export type ReportDoc = {
  id: string;
  name: string;
  date: string;
  sizeKb: number;
  status: "new" | "viewed";
  downloadUrl: string;
};

export async function getClientReports(clientId: string): Promise<ReportDoc[]> {
  const reports = await getReportsForClient(clientId);
  return reports.map((r) => toReportDoc(r));
}

function toReportDoc(report: WealthReport): ReportDoc {
  return {
    id: report.id,
    name: report.title,
    date: new Date(report.generated_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    sizeKb: report.file_size_bytes ? Math.round(report.file_size_bytes / 1024) : 0,
    status: "viewed",
    downloadUrl: `/api/reports/${report.id}/download`,
  };
}

export async function getAllReports(): Promise<(ReportDoc & { clientName: string })[]> {
  const { queryDb } = await import("@/lib/supabase/db");
  const rows = await queryDb<WealthReport & { client_name: string }>(
    `SELECT r.id, r.client_id, r.period_id, r.reference, r.title,
            r.generated_at::text, r.storage_path, r.file_size_bytes, r.status,
            r.sent_at::text, c.full_name AS client_name
     FROM wealth.reports r
     JOIN wealth.clients c ON c.id = r.client_id
     ORDER BY r.generated_at DESC`,
  );
  return rows.map((r: WealthReport & { client_name: string; sent_at?: string | null }) => ({
    ...toReportDoc(r),
    clientName: r.client_name,
    sentAt: r.sent_at ?? null,
  }));
}
