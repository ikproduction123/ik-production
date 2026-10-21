// Import Supabase JS Client via CDN ESM
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Konfigurasi Kredensial Supabase Project ik-pro.my.id
const SUPABASE_URL = "https://wmqctgkksogwqqjofyey.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcWN0Z2trc29nd3Fxam9meWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDAxMDksImV4cCI6MjEwODE3NjEwOX0.r5ZqCv8ygrhSwV1zLtkKrd-iDPIwBHGNv90k4gtMXm8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Helper Quick Check User Session
export async function getCurrentUser() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();
    if (error || !session) return null;

    // Fetch profile role
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

    return {
        ...session.user,
        profile
    };
}
