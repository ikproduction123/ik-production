import { supabaseClient } from "./supabase.js";

/* =========================================================
   IK-Pro.My.Id
   AUTH SYSTEM
   LOGIN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /* =====================================================
       ELEMENT
    ===================================================== */

    const loginForm = document.getElementById("login-form");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    const alertBox = document.getElementById("auth-alert");

    const submitButton = document.getElementById("login-submit");
    const submitText = document.getElementById("login-submit-text");
    const loadingText = document.getElementById("login-loading");

    const togglePassword = document.getElementById("toggle-password");

    /* =====================================================
       HELPER — ALERT
    ===================================================== */

    function showAlert(message, type = "error") {
        if (!alertBox) return;

        alertBox.textContent = message;

        alertBox.className = `auth-alert auth-alert-${type}`;

        alertBox.hidden = false;
    }

    function hideAlert() {
        if (!alertBox) return;

        alertBox.hidden = true;
        alertBox.textContent = "";
    }

    /* =====================================================
       HELPER — FORM ERROR
    ===================================================== */

    function clearErrors() {
        if (emailError) {
            emailError.textContent = "";
        }

        if (passwordError) {
            passwordError.textContent = "";
        }

        if (emailInput) {
            emailInput.classList.remove("input-error");
        }

        if (passwordInput) {
            passwordInput.classList.remove("input-error");
        }
    }

    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateForm() {
        clearErrors();

        let valid = true;

        const email = emailInput.value.trim();

        const password = passwordInput.value;

        /* EMAIL */

        if (!email) {
            emailError.textContent = "Email wajib diisi.";

            emailInput.classList.add("input-error");

            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = "Format email tidak valid.";

            emailInput.classList.add("input-error");

            valid = false;
        }

        /* PASSWORD */

        if (!password) {
            passwordError.textContent = "Password wajib diisi.";

            passwordInput.classList.add("input-error");

            valid = false;
        }

        return valid;
    }

    /* =====================================================
       LOADING STATE
    ===================================================== */

    function setLoading(isLoading) {
        if (submitButton) {
            submitButton.disabled = isLoading;
        }

        if (submitText) {
            submitText.hidden = isLoading;
        }

        if (loadingText) {
            loadingText.hidden = !isLoading;
        }

        if (emailInput) {
            emailInput.disabled = isLoading;
        }

        if (passwordInput) {
            passwordInput.disabled = isLoading;
        }
    }

    /* =====================================================
       CHECK EXISTING SESSION
    ===================================================== */

    async function checkExistingSession() {
        try {
            const {
                data: { session },
                error
            } = await supabaseClient.auth.getSession();

            if (error) {
                console.error("Session error:", error);

                return;
            }

            /* =============================================
               TIDAK ADA SESSION
            ============================================= */

            if (!session?.user) {
                return;
            }

            /* =============================================
               USER SUDAH LOGIN
            ============================================= */

            const { data: profile, error: profileError } = await supabaseClient
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (profileError) {
                console.error("Profile session error:", profileError);

                return;
            }

            /* =============================================
               REDIRECT ADMIN
            ============================================= */

            if (profile.role === "admin") {
                window.location.replace("/admin/index.html");

                return;
            }

            /* =============================================
               REDIRECT CLIENT
            ============================================= */

            if (profile.role === "client") {
                window.location.replace("/client/index.html");

                return;
            }

            /* =============================================
               ROLE TIDAK VALID
            ============================================= */

            await supabaseClient.auth.signOut();
        } catch (error) {
            console.error("Check session error:", error);
        }
    }

    /* Jalankan pengecekan session */

    checkExistingSession();

    /* =====================================================
       TOGGLE PASSWORD
    ===================================================== */

    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";

            togglePassword.setAttribute("aria-pressed", String(isPassword));

            togglePassword.setAttribute(
                "aria-label",
                isPassword ? "Sembunyikan password" : "Tampilkan password"
            );
        });
    }
    
    /* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    try {

        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {
            throw error;
        }


        window.location.replace(
            "/login.html"
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showAlert(
            "Gagal keluar dari akun.",
            "error"
        );
    }
}

    /* =====================================================
       LOGIN
    ===================================================== */

    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();

            hideAlert();

            /* =========================================
                   VALIDASI
                ========================================= */

            if (!validateForm()) {
                return;
            }

            const email = emailInput.value.trim();

            const password = passwordInput.value;

            try {
                setLoading(true);

                /* =====================================
                       SUPABASE AUTH
                    ===================================== */

                const { data, error } =
                    await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                /* =====================================
                       VALIDASI USER
                    ===================================== */

                if (!data?.user) {
                    throw new Error(
                        "Login gagal. Data pengguna tidak ditemukan."
                    );
                }

                /* =====================================
                       AMBIL PROFILE
                    ===================================== */

                const { data: profile, error: profileError } =
                    await supabaseClient
                        .from("profiles")
                        .select("id, name, phone, role")
                        .eq("id", data.user.id)
                        .single();

                if (profileError) {
                    console.error("Profile error:", profileError);

                    throw new Error("Profile pengguna tidak dapat ditemukan.");
                }

                /* =====================================
                       REDIRECT ADMIN
                    ===================================== */

                if (profile.role === "admin") {
                    window.location.href = "/admin/index.html";

                    return;
                }

                /* =====================================
                       REDIRECT CLIENT
                    ===================================== */

                if (profile.role === "client") {
                    window.location.href = "/client/index.html";

                    return;
                }

                /* =====================================
                       ROLE TIDAK VALID
                    ===================================== */

                await supabaseClient.auth.signOut();

                throw new Error("Role akun tidak valid.");
            } catch (error) {
                console.error("Login error:", error);

                let message = "Terjadi kesalahan saat login.";

                const errorMessage = error?.message?.toLowerCase();

                if (errorMessage?.includes("invalid login credentials")) {
                    message = "Email atau password salah.";
                } else if (errorMessage?.includes("email not confirmed")) {
                    message = "Email Anda belum dikonfirmasi.";
                } else if (error?.message) {
                    message = error.message;
                }

                showAlert(message, "error");
            } finally {
                setLoading(false);
            }
        });
    }
});
