import pg from "pg";

import { supabaseDbPassword, WEALTH_PROJECT_REF } from "@/lib/supabase/env";

const globalForDb = globalThis as typeof globalThis & {
  __jaDbPool?: pg.Pool;
};

function createPool() {
  if (!supabaseDbPassword) {
    throw new Error("Missing SUPABASE_DB_PASSWORD for server database access");
  }

  return new pg.Pool({
    host: "aws-1-eu-west-1.pooler.supabase.com",
    port: 5432,
    user: `postgres.${WEALTH_PROJECT_REF}`,
    database: "postgres",
    password: supabaseDbPassword,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 20_000,
    allowExitOnIdle: true,
  });
}

export function getDbPool() {
  if (!globalForDb.__jaDbPool) {
    globalForDb.__jaDbPool = createPool();
  }
  return globalForDb.__jaDbPool;
}

export async function queryDb<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  const result = await getDbPool().query<T>(text, params);
  return result.rows;
}
