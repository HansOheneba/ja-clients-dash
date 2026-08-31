import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key, { db: { schema: "wealth" } });

const { data, error } = await supabase.from("clients").select("id").limit(1);
console.log("clients query:", { data, error: error?.message, code: error?.code });

const pub = createClient(url, key);
const { data: pubTables, error: pubErr } = await pub.from("clients").select("id").limit(1);
console.log("public clients:", { data: pubTables, error: pubErr?.message });
