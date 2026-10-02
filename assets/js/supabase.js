/* =========================================================
   IK-Pro.My.Id
   SUPABASE CLIENT
   ========================================================= */

const SUPABASE_URL = "https://urzmuomvcfdlmsrhjqlv.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyem11b212Y2ZkbG1zcmhqcWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTU2NjIsImV4cCI6MjEwNjUzMTY2Mn0.wvXP12NlTmatx5xF7F5YEoXvq02t28x1arP4fqotO_w";

if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR-PROJECT")) {
    throw new Error("SUPABASE_URL belum dikonfigurasi.");
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("YOUR_PUBLIC_ANON_KEY")) {
    throw new Error("SUPABASE_ANON_KEY belum dikonfigurasi.");
}

/*
 * Supabase client
 *
 * File ini akan digunakan oleh seluruh
 * aplikasi IK-Pro.My.Id.
 */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

export { supabaseClient, SUPABASE_URL };
