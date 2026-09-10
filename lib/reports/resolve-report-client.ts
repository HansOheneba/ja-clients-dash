import { getClientById } from "@/lib/wealth/queries";
import { JOHN_DOE_CLIENT_ID } from "@/lib/wealth/types";

const DEMO_CLIENT_IDS: Record<string, string> = {
  "john-doe": JOHN_DOE_CLIENT_ID,
};

/** Map demo slugs to wealth.clients ids, or pass through a real client uuid. */
export async function resolveReportClientId(slugOrId: string): Promise<string | null> {
  const mapped = DEMO_CLIENT_IDS[slugOrId];
  if (mapped) return mapped;

  const client = await getClientById(slugOrId);
  return client?.id ?? null;
}

export function isDbBackedDemoClient(slugOrId: string): boolean {
  return slugOrId in DEMO_CLIENT_IDS || /^[0-9a-f-]{36}$/i.test(slugOrId);
}
