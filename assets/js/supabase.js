
/* =========================================================
   IK-PRO.MY.ID
   SUPABASE CLIENT
========================================================= */

const SUPABASE_URL =
    "https://gqrlyyhtjhsjrdkctfmc.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcmx5eWh0amhzanJka2N0Zm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTg5NTEsImV4cCI6MjEwNjQ3NDk1MX0.9G3uddg_QwlXK951ExTqkMplH1_c0_PV073mVcb2caY";

/* =========================================================
   VALIDASI
========================================================= */

if (
    typeof supabase === "undefined"
) {
    console.error(
        "Supabase JS belum dimuat."
    );
} else if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY
) {
    console.error(
        "Konfigurasi Supabase belum lengkap."
    );
} else {

    /* =====================================================
       BUAT SUPABASE CLIENT
    ===================================================== */

    window.supabaseClient =
        supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    console.log(
        "Supabase client berhasil dibuat."
    );
}