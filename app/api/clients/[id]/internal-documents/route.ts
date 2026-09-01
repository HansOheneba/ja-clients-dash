import { NextResponse } from "next/server";

import { getClientById } from "@/lib/wealth/queries";
import {
  getInternalDocumentDownloadUrl,
  uploadInternalDocument,
} from "@/lib/wealth/internal-documents";
import {
  insertClientInternalDocument,
  listClientInternalDocuments,
} from "@/lib/wealth/wm-queries";
import { canMessageClient, getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canMessageClient(session.profile, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = await listClientInternalDocuments(id);
  return NextResponse.json({ documents });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canMessageClient(session.profile, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const title = String(formData.get("title") ?? file.name).trim() || file.name;
  const description = String(formData.get("description") ?? "").trim();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `internal/${id}/${crypto.randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadInternalDocument(storagePath, buffer, file.type || "application/octet-stream");

  const document = await insertClientInternalDocument({
    clientId: id,
    title,
    description,
    storagePath,
    mimeType: file.type || "application/octet-stream",
    fileSizeBytes: file.size,
    uploadedBy: session.userId,
    uploadedByAdvisorId: session.profile.advisor_id,
  });

  return NextResponse.json({ document });
}
