import { queryDb } from "@/lib/supabase/db";
import type { PortfolioBucket } from "@/lib/wealth/types";
import type {
  AttentionItem,
  AuditLogEntry,
  ClientListExtended,
  DocumentRequest,
  MessageThread,
  ReviewCadence,
  SessionRequest,
  SessionRequestStatus,
  VaultDocument,
  WmMessage,
  WmSession,
  WmSessionStatus,
} from "@/lib/wealth/wm-types";

export async function insertAuditLog(row: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  beforeValue?: Record<string, unknown> | null;
  afterValue?: Record<string, unknown> | null;
  note?: string | null;
}): Promise<AuditLogEntry> {
  const rows = await queryDb<AuditLogEntry>(
    `INSERT INTO wealth.audit_log (actor_id, action, target_type, target_id, before_value, after_value, note)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)
     RETURNING id, actor_id, action, target_type, target_id,
               before_value, after_value, note, created_at::text`,
    [
      row.actorId ?? null,
      row.action,
      row.targetType,
      row.targetId,
      row.beforeValue ? JSON.stringify(row.beforeValue) : null,
      row.afterValue ? JSON.stringify(row.afterValue) : null,
      row.note ?? null,
    ],
  );
  return rows[0]!;
}

export async function listAuditLogForClient(
  clientId: string,
  limit = 50,
): Promise<AuditLogEntry[]> {
  return queryDb<AuditLogEntry>(
    `SELECT id, actor_id, action, target_type, target_id,
            before_value, after_value, note, created_at::text
     FROM wealth.audit_log
     WHERE target_type = 'client' AND target_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [clientId, limit],
  );
}

export async function countSessionsThisWeek(advisorId?: string | null): Promise<number> {
  const rows = await queryDb<{ count: string }>(
    `SELECT COUNT(*)::int AS count
     FROM wealth.sessions s
     WHERE s.scheduled_at >= date_trunc('week', now())
       AND s.scheduled_at < date_trunc('week', now()) + interval '7 days'
       AND s.status IN ('confirmed', 'completed')
       AND ($1::uuid IS NULL OR s.advisor_id = $1)`,
    [advisorId ?? null],
  );
  return Number(rows[0]?.count ?? 0);
}

export async function listClientsExtended(
  advisorId?: string | null,
): Promise<ClientListExtended[]> {
  const rows = await queryDb<ClientListExtended & { aum: string; period_return_pct: string | null; has_open_request: boolean }>(
    `WITH latest_period AS (
       SELECT DISTINCT ON (client_id) id, client_id
       FROM wealth.statement_periods
       ORDER BY client_id, period_end DESC
     ),
     bucket_returns AS (
       SELECT s.client_id,
         CASE WHEN SUM(s.previous_value_usd) > 0
           THEN ((SUM(s.current_value_usd) - SUM(s.previous_value_usd)) / SUM(s.previous_value_usd)) * 100
           ELSE NULL
         END AS period_return_pct
       FROM wealth.portfolio_snapshots s
       JOIN latest_period lp ON lp.id = s.period_id AND lp.client_id = s.client_id
       GROUP BY s.client_id
     ),
     open_flags AS (
       SELECT c.id AS client_id,
         EXISTS (
           SELECT 1 FROM wealth.session_requests sr
           WHERE sr.client_id = c.id AND sr.status = 'pending'
         ) OR EXISTS (
           SELECT 1 FROM wealth.document_requests dr
           WHERE dr.client_id = c.id AND dr.status = 'pending'
         ) AS has_open_request
       FROM wealth.clients c
     )
     SELECT
       c.id, c.client_number, c.full_name, c.email, c.phone,
       c.status::text, c.risk_profile, c.advisor_id,
       a.full_name AS advisor_name,
       COALESCE(SUM(ps.current_value_usd), 0)::float8 AS aum,
       br.period_return_pct::float8,
       c.next_review_date::text, c.last_contact_date::text,
       c.review_cadence::text,
       NULLIF(CONCAT_WS(', ', NULLIF(addr.city, ''), NULLIF(addr.region, '')), '') AS location,
       COALESCE(of.has_open_request, false) AS has_open_request
     FROM wealth.clients c
     LEFT JOIN latest_period lp ON lp.client_id = c.id
     LEFT JOIN wealth.portfolio_snapshots ps ON ps.period_id = lp.id
     LEFT JOIN bucket_returns br ON br.client_id = c.id
     LEFT JOIN open_flags of ON of.client_id = c.id
     LEFT JOIN wealth.advisors a ON a.id = c.advisor_id
     LEFT JOIN wealth.client_addresses addr ON addr.client_id = c.id AND addr.is_primary = true
     WHERE ($1::uuid IS NULL OR c.advisor_id = $1)
     GROUP BY c.id, a.full_name, br.period_return_pct, of.has_open_request, addr.city, addr.region
     ORDER BY c.full_name ASC`,
    [advisorId ?? null],
  );
  return rows.map((r) => ({
    ...r,
    aum: Number(r.aum),
    period_return_pct: r.period_return_pct != null ? Number(r.period_return_pct) : null,
    review_cadence: r.review_cadence as ReviewCadence | null,
  }));
}

export async function getAttentionFeed(advisorId?: string | null): Promise<AttentionItem[]> {
  const items: AttentionItem[] = [];

  const sessionRequests = await queryDb<{
    id: string;
    client_id: string;
    client_name: string;
    topic: string;
    created_at: string;
  }>(
    `SELECT sr.id, sr.client_id, c.full_name AS client_name, sr.topic, sr.created_at::text
     FROM wealth.session_requests sr
     JOIN wealth.clients c ON c.id = sr.client_id
     WHERE sr.status = 'pending'
       AND ($1::uuid IS NULL OR sr.advisor_id = $1)
     ORDER BY sr.created_at DESC
     LIMIT 10`,
    [advisorId ?? null],
  );
  for (const sr of sessionRequests) {
    items.push({
      id: `sr-${sr.id}`,
      type: "session_request",
      title: `${sr.client_name} requested a session: ${sr.topic}`,
      clientId: sr.client_id,
      clientName: sr.client_name,
      href: `/advisors/dashboard/sessions?request=${sr.id}`,
      createdAt: sr.created_at,
    });
  }

  const docRequests = await queryDb<{
    id: string;
    client_id: string;
    client_name: string;
    title: string;
    created_at: string;
  }>(
    `SELECT dr.id, dr.client_id, c.full_name AS client_name, dr.title, dr.created_at::text
     FROM wealth.document_requests dr
     JOIN wealth.clients c ON c.id = dr.client_id
     WHERE dr.status = 'pending'
       AND ($1::uuid IS NULL OR dr.advisor_id = $1)
     ORDER BY dr.created_at DESC
     LIMIT 10`,
    [advisorId ?? null],
  );
  for (const dr of docRequests) {
    items.push({
      id: `dr-${dr.id}`,
      type: "document_request",
      title: `${dr.client_name} has not uploaded: ${dr.title}`,
      clientId: dr.client_id,
      clientName: dr.client_name,
      href: `/advisors/dashboard/clients/${dr.client_id}?tab=Documents`,
      createdAt: dr.created_at,
    });
  }

  const reviewDue = await queryDb<{
    id: string;
    full_name: string;
    next_review_date: string;
  }>(
    `SELECT id, full_name, next_review_date::text
     FROM wealth.clients
     WHERE status = 'review_due'
       AND ($1::uuid IS NULL OR advisor_id = $1)
     ORDER BY next_review_date ASC NULLS LAST
     LIMIT 5`,
    [advisorId ?? null],
  );
  for (const c of reviewDue) {
    items.push({
      id: `rv-${c.id}`,
      type: "review_due",
      title: `${c.full_name} is due for review`,
      clientId: c.id,
      clientName: c.full_name,
      href: `/advisors/dashboard/clients/${c.id}?tab=Profile`,
      createdAt: c.next_review_date,
    });
  }

  const recapBacklog = await queryDb<{
    id: string;
    client_id: string;
    client_name: string;
    scheduled_at: string;
  }>(
    `SELECT s.id, s.client_id, c.full_name AS client_name, s.scheduled_at::text
     FROM wealth.sessions s
     JOIN wealth.clients c ON c.id = s.client_id
     WHERE s.recap_logged_at IS NULL
       AND s.scheduled_at < now()
       AND s.status IN ('confirmed', 'completed')
       AND ($1::uuid IS NULL OR s.advisor_id = $1)
     ORDER BY s.scheduled_at ASC
     LIMIT 5`,
    [advisorId ?? null],
  );
  for (const s of recapBacklog) {
    items.push({
      id: `rc-${s.id}`,
      type: "recap_backlog",
      title: `Session recap needed for ${s.client_name}`,
      clientId: s.client_id,
      clientName: s.client_name,
      href: `/advisors/dashboard/clients/${s.client_id}?tab=Sessions`,
      createdAt: s.scheduled_at,
    });
  }

  const unread = await queryDb<{ count: string }>(
    `SELECT COUNT(DISTINCT t.id)::int AS count
     FROM wealth.message_threads t
     JOIN wealth.messages m ON m.thread_id = t.id
     WHERE m.sender_role = 'client'
       AND (t.advisor_last_read_at IS NULL OR m.created_at > t.advisor_last_read_at)
       AND ($1::uuid IS NULL OR t.advisor_id = $1)`,
    [advisorId ?? null],
  );
  const unreadCount = Number(unread[0]?.count ?? 0);
  if (unreadCount > 0) {
    items.push({
      id: "unread-messages",
      type: "message",
      title: `${unreadCount} unread message${unreadCount === 1 ? "" : "s"} from clients`,
      clientId: "",
      clientName: "",
      href: "/advisors/dashboard/messages",
      createdAt: new Date().toISOString(),
    });
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function bulkTagReviewDue(clientIds: string[]): Promise<number> {
  if (clientIds.length === 0) return 0;
  const rows = await queryDb<{ id: string }>(
    `UPDATE wealth.clients SET status = 'review_due'
     WHERE id = ANY($1::uuid[])
     RETURNING id`,
    [clientIds],
  );
  return rows.length;
}

// Sessions
export async function listSessions(
  advisorId?: string | null,
  clientId?: string | null,
): Promise<WmSession[]> {
  const rows = await queryDb<WmSession & { client_name: string }>(
    `SELECT s.id, s.client_id, s.advisor_id, s.session_request_id,
            s.title, s.scheduled_at::text, s.status::text, s.format,
            s.recap_topics, s.recap_decisions, s.recap_action_items, s.recap_next_steps,
            s.recap_logged_at::text, s.created_at::text,
            c.full_name AS client_name
     FROM wealth.sessions s
     JOIN wealth.clients c ON c.id = s.client_id
     WHERE ($1::uuid IS NULL OR s.advisor_id = $1)
       AND ($2::uuid IS NULL OR s.client_id = $2)
     ORDER BY s.scheduled_at DESC NULLS LAST`,
    [advisorId ?? null, clientId ?? null],
  );
  return rows.map((r) => ({
    ...r,
    status: r.status as WmSessionStatus,
    recap_topics: r.recap_topics ?? [],
    recap_decisions: r.recap_decisions ?? [],
    recap_action_items: r.recap_action_items ?? [],
    recap_next_steps: r.recap_next_steps ?? [],
  }));
}

export async function listSessionRequests(
  advisorId?: string | null,
  clientId?: string | null,
): Promise<SessionRequest[]> {
  const rows = await queryDb<SessionRequest & { client_name: string }>(
    `SELECT sr.id, sr.client_id, sr.advisor_id, sr.topic, sr.preferred_times,
            sr.proposed_times, sr.status::text, sr.session_id, sr.response_note,
            sr.created_at::text, sr.responded_at::text,
            c.full_name AS client_name
     FROM wealth.session_requests sr
     JOIN wealth.clients c ON c.id = sr.client_id
     WHERE ($1::uuid IS NULL OR sr.advisor_id = $1)
       AND ($2::uuid IS NULL OR sr.client_id = $2)
     ORDER BY sr.created_at DESC`,
    [advisorId ?? null, clientId ?? null],
  );
  return rows.map((r) => ({ ...r, status: r.status as SessionRequestStatus }));
}

export async function updateSessionRequest(
  id: string,
  fields: {
    status?: SessionRequestStatus;
    proposedTimes?: string;
    sessionId?: string;
    responseNote?: string;
  },
): Promise<SessionRequest | null> {
  const rows = await queryDb<SessionRequest>(
    `UPDATE wealth.session_requests SET
       status = COALESCE($2::wealth.session_request_status, status),
       proposed_times = COALESCE($3, proposed_times),
       session_id = COALESCE($4::uuid, session_id),
       response_note = COALESCE($5, response_note),
       responded_at = CASE WHEN $2 IS NOT NULL THEN now() ELSE responded_at END
     WHERE id = $1
     RETURNING id, client_id, advisor_id, topic, preferred_times, proposed_times,
               status::text, session_id, response_note, created_at::text, responded_at::text`,
    [
      id,
      fields.status ?? null,
      fields.proposedTimes ?? null,
      fields.sessionId ?? null,
      fields.responseNote ?? null,
    ],
  );
  return rows[0] ? { ...rows[0], status: rows[0].status as SessionRequestStatus } : null;
}

export async function insertSession(row: {
  clientId: string;
  advisorId: string;
  sessionRequestId?: string | null;
  title: string;
  scheduledAt: string;
  status?: WmSessionStatus;
  format?: string;
}): Promise<WmSession> {
  const rows = await queryDb<WmSession>(
    `INSERT INTO wealth.sessions (
       client_id, advisor_id, session_request_id, title, scheduled_at, status, format
     ) VALUES ($1, $2, $3, $4, $5::timestamptz, $6::wealth.session_status, $7)
     RETURNING id, client_id, advisor_id, session_request_id, title, scheduled_at::text,
               status::text, format, recap_topics, recap_decisions, recap_action_items,
               recap_next_steps, recap_logged_at::text, created_at::text`,
    [
      row.clientId,
      row.advisorId,
      row.sessionRequestId ?? null,
      row.title,
      row.scheduledAt,
      row.status ?? "confirmed",
      row.format ?? "video",
    ],
  );
  return { ...rows[0]!, status: rows[0]!.status as WmSessionStatus };
}

export async function updateSessionRecap(
  sessionId: string,
  recap: {
    topics: string[];
    decisions: string[];
    actionItems: string[];
    nextSteps: string[];
  },
): Promise<WmSession | null> {
  const rows = await queryDb<WmSession>(
    `UPDATE wealth.sessions SET
       recap_topics = $2,
       recap_decisions = $3,
       recap_action_items = $4,
       recap_next_steps = $5,
       recap_logged_at = now(),
       status = 'completed',
       updated_at = now()
     WHERE id = $1
     RETURNING id, client_id, advisor_id, session_request_id, title, scheduled_at::text,
               status::text, format, recap_topics, recap_decisions, recap_action_items,
               recap_next_steps, recap_logged_at::text, created_at::text`,
    [
      sessionId,
      recap.topics,
      recap.decisions,
      recap.actionItems,
      recap.nextSteps,
    ],
  );
  return rows[0] ? { ...rows[0], status: rows[0].status as WmSessionStatus } : null;
}

// Documents
export async function listDocumentRequests(
  advisorId?: string | null,
  clientId?: string | null,
): Promise<DocumentRequest[]> {
  const rows = await queryDb<DocumentRequest & { client_name: string }>(
    `SELECT dr.id, dr.client_id, dr.advisor_id, dr.title, dr.description,
            dr.due_date::text, dr.status::text, dr.created_at::text,
            c.full_name AS client_name
     FROM wealth.document_requests dr
     JOIN wealth.clients c ON c.id = dr.client_id
     WHERE ($1::uuid IS NULL OR dr.advisor_id = $1)
       AND ($2::uuid IS NULL OR dr.client_id = $2)
     ORDER BY dr.due_date ASC NULLS LAST, dr.created_at DESC`,
    [advisorId ?? null, clientId ?? null],
  );
  return rows;
}

export async function insertDocumentRequest(row: {
  clientId: string;
  advisorId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
}): Promise<DocumentRequest> {
  const rows = await queryDb<DocumentRequest>(
    `INSERT INTO wealth.document_requests (client_id, advisor_id, title, description, due_date)
     VALUES ($1, $2, $3, $4, $5::date)
     RETURNING id, client_id, advisor_id, title, description, due_date::text,
               status::text, created_at::text`,
    [row.clientId, row.advisorId, row.title, row.description ?? "", row.dueDate ?? null],
  );
  return rows[0]!;
}

export async function listVaultDocuments(clientId: string): Promise<VaultDocument[]> {
  return queryDb<VaultDocument>(
    `SELECT id, client_id, title, category, storage_path, file_size_bytes,
            mime_type, expires_on::text, document_request_id, uploaded_by_role,
            created_at::text
     FROM wealth.vault_documents
     WHERE client_id = $1
     ORDER BY created_at DESC`,
    [clientId],
  );
}

export async function listExpiringDocuments(
  advisorId?: string | null,
  withinDays = 30,
): Promise<(VaultDocument & { client_name: string })[]> {
  return queryDb<VaultDocument & { client_name: string }>(
    `SELECT v.id, v.client_id, v.title, v.category, v.storage_path, v.file_size_bytes,
            v.mime_type, v.expires_on::text, v.document_request_id, v.uploaded_by_role,
            v.created_at::text, c.full_name AS client_name
     FROM wealth.vault_documents v
     JOIN wealth.clients c ON c.id = v.client_id
     WHERE v.expires_on IS NOT NULL
       AND v.expires_on <= (CURRENT_DATE + $2::int)
       AND ($1::uuid IS NULL OR c.advisor_id = $1)
     ORDER BY v.expires_on ASC`,
    [advisorId ?? null, withinDays],
  );
}

// Messages
export async function getOrCreateThread(
  clientId: string,
  advisorId: string,
): Promise<MessageThread> {
  const existing = await queryDb<MessageThread>(
    `SELECT id, client_id, advisor_id, advisor_last_read_at::text,
            client_last_read_at::text, updated_at::text
     FROM wealth.message_threads WHERE client_id = $1`,
    [clientId],
  );
  if (existing[0]) return existing[0];

  const rows = await queryDb<MessageThread>(
    `INSERT INTO wealth.message_threads (client_id, advisor_id)
     VALUES ($1, $2)
     RETURNING id, client_id, advisor_id, advisor_last_read_at::text,
               client_last_read_at::text, updated_at::text`,
    [clientId, advisorId],
  );
  return rows[0]!;
}

export async function listMessageThreads(
  advisorId?: string | null,
): Promise<MessageThread[]> {
  const rows = await queryDb<MessageThread & { client_name: string; last_message: string; unread_count: string }>(
    `SELECT t.id, t.client_id, t.advisor_id, t.advisor_last_read_at::text,
            t.client_last_read_at::text, t.updated_at::text,
            c.full_name AS client_name,
            (SELECT body FROM wealth.messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
            (SELECT COUNT(*)::int FROM wealth.messages m
             WHERE m.thread_id = t.id AND m.sender_role = 'client'
               AND (t.advisor_last_read_at IS NULL OR m.created_at > t.advisor_last_read_at)
            ) AS unread_count
     FROM wealth.message_threads t
     JOIN wealth.clients c ON c.id = t.client_id
     WHERE ($1::uuid IS NULL OR t.advisor_id = $1)
     ORDER BY t.updated_at DESC`,
    [advisorId ?? null],
  );
  return rows.map((r) => ({
    ...r,
    unread_count: Number(r.unread_count),
  }));
}

export async function listMessages(threadId: string): Promise<WmMessage[]> {
  return queryDb<WmMessage>(
    `SELECT id, thread_id, sender_role, sender_id, body,
            attachment_type, attachment_id, created_at::text
     FROM wealth.messages
     WHERE thread_id = $1
     ORDER BY created_at ASC`,
    [threadId],
  );
}

export async function insertMessage(row: {
  threadId: string;
  senderRole: "advisor" | "client";
  senderId?: string | null;
  body: string;
  attachmentType?: string | null;
  attachmentId?: string | null;
}): Promise<WmMessage> {
  const rows = await queryDb<WmMessage>(
    `INSERT INTO wealth.messages (thread_id, sender_role, sender_id, body, attachment_type, attachment_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, thread_id, sender_role, sender_id, body,
               attachment_type, attachment_id, created_at::text`,
    [
      row.threadId,
      row.senderRole,
      row.senderId ?? null,
      row.body,
      row.attachmentType ?? null,
      row.attachmentId ?? null,
    ],
  );
  await queryDb(`UPDATE wealth.message_threads SET updated_at = now() WHERE id = $1`, [
    row.threadId,
  ]);
  return rows[0]!;
}

export async function markThreadReadByAdvisor(threadId: string): Promise<void> {
  await queryDb(
    `UPDATE wealth.message_threads SET advisor_last_read_at = now() WHERE id = $1`,
    [threadId],
  );
}

export async function syncGoalsFromPortfolio(
  clientId: string,
  bucketValues: Partial<Record<PortfolioBucket, number>>,
): Promise<void> {
  for (const [bucket, value] of Object.entries(bucketValues)) {
    if (value == null) continue;
    await queryDb(
      `UPDATE wealth.client_goals
       SET current_usd = $3, updated_at = now()
       WHERE client_id = $1 AND linked_bucket = $2::wealth.portfolio_bucket`,
      [clientId, bucket, value],
    );
  }
}

export async function enforceReviewDueStatus(): Promise<number> {
  const rows = await queryDb<{ id: string }>(
    `UPDATE wealth.clients
     SET status = 'review_due'
     WHERE next_review_date IS NOT NULL
       AND next_review_date < CURRENT_DATE
       AND status = 'active'
     RETURNING id`,
  );
  return rows.length;
}

export async function getNextSessionForClient(clientId: string): Promise<WmSession | null> {
  const rows = await queryDb<WmSession>(
    `SELECT id, client_id, advisor_id, session_request_id, title, scheduled_at::text,
            status::text, format, recap_topics, recap_decisions, recap_action_items,
            recap_next_steps, recap_logged_at::text, created_at::text
     FROM wealth.sessions
     WHERE client_id = $1
       AND scheduled_at >= now()
       AND status IN ('confirmed', 'requested')
     ORDER BY scheduled_at ASC
     LIMIT 1`,
    [clientId],
  );
  return rows[0] ? { ...rows[0], status: rows[0].status as WmSessionStatus } : null;
}

export function computeNextReviewDate(
  cadence: ReviewCadence,
  fromDate = new Date(),
): string {
  const d = new Date(fromDate);
  if (cadence === "quarterly") d.setMonth(d.getMonth() + 3);
  else if (cadence === "semi_annual") d.setMonth(d.getMonth() + 6);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
