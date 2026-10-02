const SUPABASE_URL = "https://gqrlyyhtjhsjrdkctfmc.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcmx5eWh0amhzanJka2N0Zm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTg5NTEsImV4cCI6MjEwNjQ3NDk1MX0.9G3uddg_QwlXK951ExTqkMplH1_c0_PV073mVcb2caY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);