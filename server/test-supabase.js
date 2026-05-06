import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY:", process.env.SUPABASE_ANON_KEY?.slice(0, 10));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

try {
  const { data, error } = await supabase.from("leads").select("*");

  if (error) {
    console.error("Supabase test error:", error);
    process.exit(1);
  }

  console.log("Supabase test success:", {
    count: data?.length || 0,
    sample: data?.slice(0, 3) || [],
  });
} catch (error) {
  console.error("Supabase test exception:", error);
  process.exit(1);
}
