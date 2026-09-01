import { createAdminClient } from "@/lib/supabase/admin";

export async function getInternalDocumentDownloadUrl(
  storagePath: string,
  expiresIn = 3600,
) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("vault")
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not create download URL");
  }
  return data.signedUrl;
}

export async function uploadInternalDocument(
  storagePath: string,
  file: Buffer,
  mimeType: string,
) {
  const admin = createAdminClient();
  const { error } = await admin.storage.from("vault").upload(storagePath, file, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw new Error(error.message);
}
