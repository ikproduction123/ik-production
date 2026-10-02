/* =========================================================
   IK-PRO.MY.ID
   AUTHENTICATION JAVASCRIPT
========================================================= */


/* =========================================================
   CUSTOM ALERT
========================================================= */

function showAlert(
    type,
    title,
    message,
    duration = 4000
) {

    const container =
        document.getElementById("alertContainer");

    if (!container) {
        return;
    }

    const icons = {
        success: "✓",
        error: "!",
        warning: "!",
        info: "i"
    };

    const alert =
        document.createElement("div");

    alert.className =
        `alert alert-${type}`;

    alert.innerHTML = `
        <div class="alert-icon">
            ${icons[type] || "i"}
        </div>

        <div class="alert-content">
            <div class="alert-title">
                ${title}
            </div>

            <div class="alert-message">
                ${message}
            </div>
        </div>

        <button
            type="button"
            class="alert-close"
            aria-label="Tutup"
        >
            ×
        </button>
    `;

    container.appendChild(alert);


    /* =========================================
       CLOSE BUTTON
    ========================================== */

    const closeButton =
        alert.querySelector(".alert-close");

    closeButton?.addEventListener(
        "click",
        () => {
            closeAlert(alert);
        }
    );


    /* =========================================
       AUTO CLOSE
    ========================================== */

    if (duration > 0) {

        setTimeout(() => {

            closeAlert(alert);

        }, duration);
    }
}


/* =========================================================
   CLOSE ALERT
========================================================= */

function closeAlert(alert) {

    if (
        !alert ||
        alert.classList.contains("hide")
    ) {
        return;
    }

    alert.classList.add("hide");

    setTimeout(() => {

        alert.remove();

    }, 350);
}


/* =========================================================
   CHECK SUPABASE CLIENT
========================================================= */

function getSupabaseClient() {

    if (!window.supabaseClient) {

        console.error(
            "Supabase client tidak ditemukan."
        );

        showAlert(
            "error",
            "Konfigurasi error",
            "Supabase belum berhasil dimuat."
        );

        return null;
    }

    return window.supabaseClient;
}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

document
    .querySelectorAll(".toggle-password")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const input =
                    button.parentElement
                        ?.querySelector("input");

                if (!input) {
                    return;
                }

                if (
                    input.type === "password"
                ) {

                    input.type = "text";

                    button.textContent = "🙈";

                } else {

                    input.type = "password";

                    button.textContent = "👁";
                }
            }
        );
    });


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* =====================================
               CLIENT
            ====================================== */

            const client =
                getSupabaseClient();

            if (!client) {
                return;
            }


            /* =====================================
               FORM DATA
            ====================================== */

            const email =
                document
                    .getElementById("loginEmail")
                    ?.value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    ?.value;


            /* =====================================
               VALIDATION
            ====================================== */

            if (!email || !password) {

                showAlert(
                    "warning",
                    "Data belum lengkap",
                    "Silakan isi email dan password."
                );

                return;
            }


            /* =====================================
               BUTTON
            ====================================== */

            const button =
                loginForm.querySelector(
                    ".btn-primary"
                );

            const originalText =
                button
                    ? button.textContent
                    : "Masuk";


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Memproses...";
            }


            try {

                /* =================================
                   SUPABASE LOGIN
                ================================= */

                const {
                    data,
                    error
                } =
                    await client.auth
                        .signInWithPassword({
                            email,
                            password
                        });


                /* =================================
                   ERROR
                ================================= */

                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );

                    showAlert(
                        "error",
                        "Login gagal",
                        error.message
                    );

                    return;
                }


                /* =================================
                   SUCCESS
                ================================= */

                console.log(
                    "Login berhasil:",
                    data.user
                );

                showAlert(
                    "success",
                    "Login berhasil",
                    "Selamat datang kembali. Mengalihkan ke dashboard...",
                    1500
                );


                setTimeout(() => {

                    window.location.href =
                        "dashboard/index.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Login exception:",
                    error
                );

                showAlert(
                    "error",
                    "Terjadi kesalahan",
                    "Tidak dapat memproses login."
                );

            } finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        originalText;
                }
            }
        }
    );
}


/* =========================================================
   REGISTER
========================================================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* =====================================
               CLIENT
            ====================================== */

            const client =
                getSupabaseClient();

            if (!client) {
                return;
            }


            /* =====================================
               FORM DATA
            ====================================== */

            const name =
                document
                    .getElementById("registerName")
                    ?.value
                    .trim();

            const phone =
                document
                    .getElementById("registerPhone")
                    ?.value
                    .trim();

            const email =
                document
                    .getElementById("registerEmail")
                    ?.value
                    .trim();

            const password =
                document
                    .getElementById("registerPassword")
                    ?.value;


            /* =====================================
               VALIDATION
            ====================================== */

            if (
                !name ||
                !phone ||
                !email ||
                !password
            ) {

                showAlert(
                    "warning",
                    "Data belum lengkap",
                    "Silakan lengkapi semua data terlebih dahulu."
                );

                return;
            }


            /* =====================================
               PASSWORD
            ====================================== */

            if (password.length < 6) {

                showAlert(
                    "warning",
                    "Password terlalu pendek",
                    "Password minimal terdiri dari 6 karakter."
                );

                return;
            }


            /* =====================================
               BUTTON
            ====================================== */

            const button =
                registerForm.querySelector(
                    ".btn-primary"
                );

            const originalText =
                button
                    ? button.textContent
                    : "Daftar";


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Mendaftar...";
            }


            try {

                /* =================================
                   SUPABASE REGISTER
                ================================= */

                const {
                    data,
                    error
                } =
                    await client.auth.signUp({

                        email,

                        password,

                        options: {

                            data: {
                                name,
                                phone
                            }
                        }
                    });


                /* =================================
                   ERROR
                ================================= */

                if (error) {

                    console.error(
                        "Register error:",
                        error
                    );

                    showAlert(
                        "error",
                        "Pendaftaran gagal",
                        error.message
                    );

                    return;
                }


                /* =================================
                   SUCCESS
                ================================= */

                console.log(
                    "Register berhasil:",
                    data
                );


                showAlert(
                    "success",
                    "Pendaftaran berhasil",
                    "Silakan cek email untuk melakukan verifikasi.",
                    3000
                );


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 3000);


            } catch (error) {

                console.error(
                    "Register exception:",
                    error
                );

                showAlert(
                    "error",
                    "Terjadi kesalahan",
                    "Tidak dapat memproses pendaftaran."
                );

            } finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        originalText;
                }
            }
        }
    );
}