import { NextResponse } from "next/server";

import { getClientUnreadMessageCount } from "@/lib/wealth/wm-queries";
import { getClientApiSession } from "@/lib/wealth/session";

export async function GET() {
  const session = await getClientApiSession();
  if (!session.ok) return session.response;

  const [messageCount, pendingDocs] = await Promise.all([
    getClientUnreadMessageCount(session.profile.client_id),
    import("@/lib/wealth/wm-queries").then((m) =>
      m.getFirstPendingDocumentRequest(session.profile.client_id),
    ),
  ]);

  return NextResponse.json({
    unreadMessages: messageCount,
    pendingDocuments: pendingDocs ? 1 : 0,
  });
}
