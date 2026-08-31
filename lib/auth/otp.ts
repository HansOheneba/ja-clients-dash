import { createHash, randomInt } from "node:crypto";

import { queryDb } from "@/lib/supabase/db";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
// A submitted form can reach the server more than once (double click, browser
// retry, the router replaying the server action after its redirect). The first
// run consumes the code, so without a replay window the duplicate run reports a
// correct code as invalid and overwrites the successful redirect.
const REPLAY_GRACE_MS = 2 * 60 * 1000;

function otpSecret() {
  return (
    process.env.OTP_PEPPER ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "ja-login-otp-dev"
  );
}

function hashCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email}:${code}:${otpSecret()}`)
    .digest("hex");
}

function generateCode() {
  return String(randomInt(100000, 1000000));
}

export async function issueLoginOtp(email: string) {
  const existing = await queryDb<{ last_sent_at: Date; consumed_at: Date | null }>(
    `SELECT last_sent_at, consumed_at FROM wealth.login_otps WHERE email = $1`,
    [email],
  );

  if (existing[0] && !existing[0].consumed_at) {
    const elapsed = Date.now() - new Date(existing[0].last_sent_at).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const seconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Please wait ${seconds} seconds before requesting another code.`);
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await queryDb(
    `INSERT INTO wealth.login_otps (email, code_hash, expires_at, attempts, last_sent_at, consumed_at)
     VALUES ($1, $2, $3, 0, now(), NULL)
     ON CONFLICT (email) DO UPDATE SET
       code_hash = EXCLUDED.code_hash,
       expires_at = EXCLUDED.expires_at,
       attempts = 0,
       last_sent_at = now(),
       consumed_at = NULL`,
    [email, hashCode(email, code), expiresAt.toISOString()],
  );

  await queryDb(
    `DELETE FROM wealth.login_otps WHERE expires_at < now() - interval '1 day'`,
  );

  return code;
}

export async function verifyLoginOtpCode(email: string, code: string) {
  const rows = await queryDb<{
    code_hash: string;
    expires_at: Date;
    attempts: number;
    consumed_at: Date | null;
  }>(
    `SELECT code_hash, expires_at, attempts, consumed_at
     FROM wealth.login_otps WHERE email = $1`,
    [email],
  );

  const row = rows[0];
  if (!row) {
    return false;
  }

  const matches = row.code_hash === hashCode(email, code);

  if (row.consumed_at) {
    const consumedAgo = Date.now() - new Date(row.consumed_at).getTime();
    return matches && consumedAgo < REPLAY_GRACE_MS;
  }

  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new Error("Too many incorrect attempts. Request a new code.");
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await queryDb(`DELETE FROM wealth.login_otps WHERE email = $1`, [email]);
    return false;
  }

  if (!matches) {
    await queryDb(
      `UPDATE wealth.login_otps SET attempts = attempts + 1 WHERE email = $1`,
      [email],
    );
    return false;
  }

  await queryDb(
    `UPDATE wealth.login_otps SET consumed_at = now() WHERE email = $1`,
    [email],
  );
  return true;
}
