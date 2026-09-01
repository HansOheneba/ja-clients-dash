import type { ReportKind } from "@/lib/wealth/period-calendar";
import type { ClientStatus, PortfolioBucket } from "@/lib/wealth/types";

export type ReviewCadence = "quarterly" | "semi_annual" | "annual";
export type SessionRequestStatus = "pending" | "accepted" | "declined" | "rescheduled";
export type WmSessionStatus = "requested" | "confirmed" | "completed" | "cancelled";
export type DocumentRequestStatus = "pending" | "uploaded" | "expired";
export type AttentionItemType =
  | "session_request"
  | "document_request"
  | "document_expiry"
  | "message"
  | "review_due"
  | "recap_backlog"
  | "report_due";

export type OutstandingReport = {
  clientId: string;
  clientName: string;
  periodId: string;
  periodEnd: string;
  kind: ReportKind;
  windowLabel: string;
};

export interface AttentionItem {
  id: string;
  type: AttentionItemType;
  title: string;
  clientId: string;
  clientName: string;
  href: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  note: string | null;
  created_at: string;
}

export interface WmSession {
  id: string;
  client_id: string;
  advisor_id: string;
  session_request_id: string | null;
  title: string;
  scheduled_at: string | null;
  status: WmSessionStatus;
  format: string;
  recap_topics: string[];
  recap_decisions: string[];
  recap_action_items: string[];
  recap_next_steps: string[];
  recap_logged_at: string | null;
  created_at: string;
  client_name?: string;
}

export interface SessionRequest {
  id: string;
  client_id: string;
  advisor_id: string;
  topic: string;
  preferred_times: string;
  proposed_times: string | null;
  status: SessionRequestStatus;
  session_id: string | null;
  response_note: string | null;
  created_at: string;
  responded_at: string | null;
  client_name?: string;
}

export interface DocumentRequest {
  id: string;
  client_id: string;
  advisor_id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: DocumentRequestStatus;
  created_at: string;
  client_name?: string;
}

export interface VaultDocument {
  id: string;
  client_id: string;
  title: string;
  category: string;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string;
  expires_on: string | null;
  document_request_id: string | null;
  uploaded_by_role: string;
  created_at: string;
}

export interface MessageThread {
  id: string;
  client_id: string;
  advisor_id: string;
  advisor_last_read_at: string | null;
  client_last_read_at: string | null;
  updated_at: string;
  client_name?: string;
  last_message?: string;
  unread_count?: number;
}

export interface WmMessage {
  id: string;
  thread_id: string;
  sender_role: "advisor" | "client";
  sender_id: string | null;
  sender_name?: string | null;
  body: string;
  attachment_type: string | null;
  attachment_id: string | null;
  created_at: string;
}

export interface ClientAdvisorNote {
  id: string;
  client_id: string;
  author_user_id: string | null;
  author_advisor_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
  attachments: ClientInternalDocument[];
}

export interface ClientInternalDocument {
  id: string;
  client_id: string;
  title: string;
  description: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  uploaded_by_advisor_id: string | null;
  uploader_name: string;
  created_at: string;
}

export interface ClientListExtended {
  id: string;
  client_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: ClientStatus;
  risk_profile: string | null;
  advisor_id: string | null;
  advisor_name: string | null;
  aum: number;
  period_return_pct: number | null;
  next_review_date: string | null;
  last_contact_date: string | null;
  review_cadence: ReviewCadence | null;
  location: string | null;
  has_open_request: boolean;
}

export type ReportSectionKey =
  | "executive_summary"
  | "portfolio_overview"
  | "performance"
  | "transactions";

export const ALL_REPORT_SECTIONS: ReportSectionKey[] = [
  "executive_summary",
  "portfolio_overview",
  "performance",
  "transactions",
];

export const REPORT_TEMPLATES: Record<
  string,
  { label: string; sections: ReportSectionKey[] }
> = {
  standard_monthly: {
    label: "Standard monthly",
    sections: [...ALL_REPORT_SECTIONS],
  },
  quarterly_deep_dive: {
    label: "Quarterly deep-dive",
    sections: [...ALL_REPORT_SECTIONS],
  },
};

export type { PortfolioBucket };
