import { NextResponse } from "next/server";

import { getClientById } from "@/lib/wealth/queries";
import { getInternalDocumentDownloadUrl } from "@/lib/wealth/internal-documents";
import { getClientInternalDocument } from "@/lib/wealth/wm-queries";
import { canMessageClient, getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id, docId } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canMessageClient(session.profile, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const document = await getClientInternalDocument(docId);
  if (!document || document.client_id !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getInternalDocumentDownloadUrl(document.storage_path);
  return NextResponse.json({ url, title: document.title });
}
