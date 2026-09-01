import { supabaseUrl } from "@/lib/supabase/env";

export const EMAIL_LOGO_PATH = "JA_Wealth_wht.png";

export function emailLogoUrl() {
  const base = supabaseUrl?.replace(/\/$/, "") ?? "";
  return `${base}/storage/v1/object/public/brand/${EMAIL_LOGO_PATH}`;
}
