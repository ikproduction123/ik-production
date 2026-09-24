import { supabase } from "../lib/supabase";

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  return {
    success: !error,
    error,
  };
}
