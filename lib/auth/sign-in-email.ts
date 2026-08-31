import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseServiceRoleKey } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function isExistingUserError(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("already been registered") || lower.includes("already exists");
}

export async function signInWithEmail(email: string) {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Server missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local from Supabase Dashboard → Settings → API → service_role, then restart the dev server.",
    );
  }

  const admin = createAdminClient();

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (createError && !isExistingUserError(createError.message)) {
    throw createError;
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    throw linkError ?? new Error("Failed to start session");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (error || !data.user) {
    throw error ?? new Error("Failed to create session");
  }

  return data.user;
}
