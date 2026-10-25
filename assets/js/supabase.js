import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Ganti dengan data project Supabase Anda.
const SUPABASE_URL = "https://ruheciocciflhbqmpcqb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aGVjaW9jY2lmbGhicW1wY3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MjI0NjcsImV4cCI6MjEwODQ5ODQ2N30.KyZ7SpOiiCVgJtt2d-LXfYaoTSu3pVzV_YxATich0Zg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
