document.addEventListener("DOMContentLoaded", () => {

    /*
     * Password visibility
     */

    const passwordToggles =
        document.querySelectorAll(".password-toggle");

    passwordToggles.forEach((button) => {

        button.addEventListener("click", () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            if (!input) return;

            if (input.type === "password") {

                input.type = "text";
                button.textContent = "Sembunyikan";

            } else {

                input.type = "password";
                button.textContent = "Lihat";

            }

        });

    });


    /*
     * Login
     *
     * Supabase Auth akan ditambahkan
     * pada tahap berikutnya.
     */

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            showMessage(
                "Login Supabase akan dihubungkan pada tahap berikutnya.",
                "success"
            );

        });

    }


    /*
     * Register
     *
     * Supabase Auth akan ditambahkan
     * pada tahap berikutnya.
     */

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {

                showMessage(
                    "Konfirmasi password tidak sama.",
                    "error"
                );

                return;
            }

            showMessage(
                "Form registrasi siap dihubungkan ke Supabase.",
                "success"
            );

        });

    }


    function showMessage(message, type) {

        const messageElement =
            document.getElementById("formMessage");

        if (!messageElement) return;

        messageElement.textContent = message;

        messageElement.className =
            `form-message show ${type}`;

    }

});
