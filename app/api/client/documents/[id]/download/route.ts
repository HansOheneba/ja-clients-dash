import { NextResponse } from "next/server";

import { getInternalDocumentDownloadUrl } from "@/lib/wealth/internal-documents";
import { getVaultDocumentById } from "@/lib/wealth/wm-queries";
import { getClientApiSession } from "@/lib/wealth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getClientApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const doc = await getVaultDocumentById(id, session.profile.client_id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getInternalDocumentDownloadUrl(doc.storage_path);
  return NextResponse.redirect(url);
}
