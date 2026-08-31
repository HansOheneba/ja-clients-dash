import { readFile } from "node:fs/promises";
import path from "node:path";

import { queryDb } from "@/lib/supabase/db";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "not available" }, { status: 404 });
  }

  const file = new URL(request.url).searchParams.get("file");
  if (!file || !/^[\w.-]+\.sql$/.test(file)) {
    return Response.json({ error: "file query param required" }, { status: 400 });
  }

  const sql = await readFile(
    path.join(process.cwd(), "supabase/migrations", file),
    "utf8",
  );
  await queryDb(sql);

  const columns = await queryDb<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'wealth' AND table_name = 'advisors'
     ORDER BY ordinal_position`,
  );
  const advisors = await queryDb<{ email: string; is_admin: boolean; is_active: boolean }>(
    `SELECT email, is_admin, is_active FROM wealth.advisors ORDER BY email`,
  );
  const disclaimer = await queryDb<{ title: string }>(
    `SELECT title FROM wealth.disclaimers WHERE is_active = true`,
  );

  return Response.json({
    applied: file,
    advisorColumns: columns.map((c) => c.column_name),
    advisors,
    disclaimerTitle: disclaimer[0]?.title ?? null,
  });
}
