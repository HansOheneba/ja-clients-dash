import { createHash, randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const pool = new pg.Pool({
  host: "aws-1-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${env.WEALTH_PROJECT_REF || "mmubhwyxszonhnpyeosy"}`,
  database: "postgres",
  password: env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const secret = env.OTP_PEPPER || env.SUPABASE_SERVICE_ROLE_KEY || "ja-login-otp-dev";
const testEmail = "otp-debug@example.com";
const testCode = String(randomInt(100000, 1000000));
const testHash = createHash("sha256")
  .update(`${testEmail}:${testCode}:${secret}`)
  .digest("hex");
const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

const existing = await pool.query(`SELECT email, attempts, expires_at, last_sent_at FROM wealth.login_otps`);
console.log("existing_rows", existing.rows);

await pool.query(
  `INSERT INTO wealth.login_otps (email, code_hash, expires_at, attempts, last_sent_at)
   VALUES ($1, $2, $3, 0, now())
   ON CONFLICT (email) DO UPDATE SET
     code_hash = EXCLUDED.code_hash,
     expires_at = EXCLUDED.expires_at,
     attempts = 0,
     last_sent_at = now()`,
  [testEmail, testHash, expiresAt.toISOString()],
);

const roundtrip = await pool.query(
  `SELECT email, code_hash, expires_at, attempts, now() AS db_now
   FROM wealth.login_otps WHERE email = $1`,
  [testEmail],
);
const row = roundtrip.rows[0];
const expires = new Date(row.expires_at);
console.log("roundtrip", {
  expires_at_constructor: row.expires_at?.constructor?.name,
  expires_at_iso: expires.toISOString(),
  db_now: row.db_now,
  ttl_ms: expires.getTime() - Date.now(),
  considered_expired: expires.getTime() < Date.now(),
  hash_match: row.code_hash === testHash,
});

await pool.query(`DELETE FROM wealth.login_otps WHERE email = $1`, [testEmail]);
await pool.end();
