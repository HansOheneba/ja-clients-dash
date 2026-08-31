import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRef = "mmubhwyxszonhnpyeosy";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD in .env or .env.local");
  process.exit(1);
}

const poolerHosts = [
  "aws-1-eu-west-1.pooler.supabase.com",
  `db.${projectRef}.supabase.co`,
];

async function connect() {
  for (const host of poolerHosts) {
    const isPooler = host.includes("pooler");
    const client = new pg.Client({
      host,
      port: 5432,
      database: "postgres",
      user: isPooler ? `postgres.${projectRef}` : "postgres",
      password,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      console.log(`Connected via ${host}`);
      return client;
    } catch (err) {
      console.warn(`Failed ${host}:`, err.message);
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  throw new Error("Could not connect to Supabase Postgres for wealth project");
}

const client = await connect();

async function main() {
  const { rows } = await client.query(
    "SELECT current_database() AS db, current_user AS usr"
  );
  console.log(`Connected to ${rows[0].db} as ${rows[0].usr}`);

  const migrationsDir = join(__dirname, "..", "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.wealth_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    const { rows: applied } = await client.query(
      "SELECT 1 FROM public.wealth_migrations WHERE name = $1",
      [file]
    );
    if (applied.length > 0) {
      console.log(`Skip ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO public.wealth_migrations (name) VALUES ($1)",
        [file]
      );
      await client.query("COMMIT");
      console.log(`Applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  }

  const tables = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = 'wealth'
    ORDER BY table_name
  `);
  console.log("Wealth tables:", tables.rows.map((r) => r.table_name).join(", "));
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
