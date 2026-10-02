const SUPABASE_URL = "https://gqrlyyhtjhsjrdkctfmc.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcmx5eWh0amhzanJka2N0Zm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTg5NTEsImV4cCI6MjEwNjQ3NDk1MX0.9G3uddg_QwlXK951ExTqkMplH1_c0_PV073mVcb2caY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ========================================
   CUSTOM ALERT
======================================== */

function showAlert(type, title, message, duration = 4000) {
    const container = document.getElementById("alertContainer");

    if (!container) return;

    const icons = {
        success: "✓",
        error: "!",
        warning: "!",
        info: "i"
    };

    const alert = document.createElement("div");

    alert.className = `alert alert-${type}`;

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

    /* Tombol close */

    const closeButton = alert.querySelector(".alert-close");

    closeButton.addEventListener("click", () => {
        closeAlert(alert);
    });

    /* Auto close */

    if (duration > 0) {
        setTimeout(() => {
            closeAlert(alert);
        }, duration);
    }
}

/* ========================================
   CLOSE ALERT
======================================== */

function closeAlert(alert) {
    if (!alert || alert.classList.contains("hide")) {
        return;
    }

    alert.classList.add("hide");

    setTimeout(() => {
        alert.remove();
    }, 350);
}

/* ========================================
   TOGGLE PASSWORD
======================================== */

document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = button.parentElement.querySelector("input");

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "🙈";
        } else {
            input.type = "password";
            button.textContent = "👁";
        }
    });
});

/* ========================================
   LOGIN
======================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();

        const password = document.getElementById("loginPassword").value;

        /* Validasi */

        if (!email || !password) {
            showAlert(
                "warning",
                "Data belum lengkap",
                "Silakan isi email dan password."
            );

            return;
        }

        /* Loading */

        const button = loginForm.querySelector(".btn-primary");

        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = "Memproses...";

        /* Login Supabase */

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        button.disabled = false;
        button.textContent = originalText;

        /* Error */

        if (error) {
            showAlert("error", "Login gagal", error.message);

            return;
        }

        /* Success */

        showAlert(
            "success",
            "Login berhasil",
            "Selamat datang kembali. Mengalihkan ke dashboard...",
            1500
        );

        setTimeout(() => {
            window.location.href = "https://ik-pro.my.id/dashboard/index.html";
        }, 1500);
    });
}

/* ========================================
   REGISTER
======================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async e => {
        e.preventDefault();

        const name = document.getElementById("registerName").value.trim();

        const phone = document.getElementById("registerPhone").value.trim();

        const email = document.getElementById("registerEmail").value.trim();

        const password = document.getElementById("registerPassword").value;

        /* Validasi */

        if (!name || !phone || !email || !password) {
            showAlert(
                "warning",
                "Data belum lengkap",
                "Silakan lengkapi semua data terlebih dahulu."
            );

            return;
        }

        /* Password */

        if (password.length < 6) {
            showAlert(
                "warning",
                "Password terlalu pendek",
                "Password minimal terdiri dari 6 karakter."
            );

            return;
        }

        /* Loading */

        const button = registerForm.querySelector(".btn-primary");

        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = "Mendaftar...";

        /* Register Supabase */

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,

            options: {
                data: {
                    name,
                    phone
                }
            }
        });

        button.disabled = false;
        button.textContent = originalText;

        /* Error */

        if (error) {
            showAlert("error", "Pendaftaran gagal", error.message);

            return;
        }

        /* Success */

        showAlert(
            "success",
            "Pendaftaran berhasil",
            "Silakan cek email untuk melakukan verifikasi.",
            3000
        );

        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);
    });
}
