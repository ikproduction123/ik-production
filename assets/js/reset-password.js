import { supabaseClient } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById(
        "reset-password-form"
    );

    const passwordInput = document.getElementById(
        "password"
    );

    const confirmPasswordInput = document.getElementById(
        "confirm-password"
    );

    const passwordError = document.getElementById(
        "password-error"
    );

    const confirmPasswordError = document.getElementById(
        "confirm-password-error"
    );

    const alertBox = document.getElementById(
        "auth-alert"
    );

    const submitButton = document.getElementById(
        "reset-password-submit"
    );

    const submitText = document.getElementById(
        "reset-password-submit-text"
    );

    const loadingText = document.getElementById(
        "reset-password-loading"
    );

    const togglePassword = document.getElementById(
        "toggle-password"
    );

    const toggleConfirmPassword =
        document.getElementById(
            "toggle-confirm-password"
        );


    /* =========================================================
       ALERT
    ========================================================= */

    function showAlert(message, type = "error") {
        if (!alertBox) return;

        alertBox.textContent = message;

        alertBox.className =
            `auth-alert auth-alert-${type}`;

        alertBox.hidden = false;
    }


    function hideAlert() {
        if (!alertBox) return;

        alertBox.hidden = true;
        alertBox.textContent = "";
    }


    /* =========================================================
       ERROR
    ========================================================= */

    function clearErrors() {
        if (passwordError) {
            passwordError.textContent = "";
        }

        if (confirmPasswordError) {
            confirmPasswordError.textContent = "";
        }

        if (passwordInput) {
            passwordInput.classList.remove(
                "input-error"
            );
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.classList.remove(
                "input-error"
            );
        }
    }


    /* =========================================================
       VALIDATION PASSWORD
    ========================================================= */

    function validatePassword() {
        const password =
            passwordInput.value;

        if (!password) {
            passwordError.textContent =
                "Password wajib diisi.";

            passwordInput.classList.add(
                "input-error"
            );

            return false;
        }

        if (password.length < 8) {
            passwordError.textContent =
                "Password minimal 8 karakter.";

            passwordInput.classList.add(
                "input-error"
            );

            return false;
        }

        if (password.length > 72) {
            passwordError.textContent =
                "Password maksimal 72 karakter.";

            passwordInput.classList.add(
                "input-error"
            );

            return false;
        }

        return true;
    }


    /* =========================================================
       VALIDATION CONFIRM PASSWORD
    ========================================================= */

    function validateConfirmPassword() {
        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;

        if (!confirmPassword) {
            confirmPasswordError.textContent =
                "Konfirmasi password wajib diisi.";

            confirmPasswordInput.classList.add(
                "input-error"
            );

            return false;
        }

        if (password !== confirmPassword) {
            confirmPasswordError.textContent =
                "Konfirmasi password tidak sama.";

            confirmPasswordInput.classList.add(
                "input-error"
            );

            return false;
        }

        return true;
    }


    /* =========================================================
       FORM VALIDATION
    ========================================================= */

    function validateForm() {
        clearErrors();

        const passwordValid =
            validatePassword();

        const confirmValid =
            validateConfirmPassword();

        return passwordValid && confirmValid;
    }


    /* =========================================================
       LOADING
    ========================================================= */

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

        if (passwordInput) {
            passwordInput.disabled = isLoading;
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.disabled = isLoading;
        }
    }


    /* =========================================================
       PASSWORD TOGGLE
    ========================================================= */

    function setupPasswordToggle(
        button,
        input
    ) {
        if (!button || !input) return;

        button.addEventListener(
            "click",
            () => {

                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword
                        ? "text"
                        : "password";

                button.setAttribute(
                    "aria-pressed",
                    String(isPassword)
                );

                button.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                );
            }
        );
    }


    setupPasswordToggle(
        togglePassword,
        passwordInput
    );

    setupPasswordToggle(
        toggleConfirmPassword,
        confirmPasswordInput
    );


    /* =========================================================
       CHECK RECOVERY SESSION
    ========================================================= */

    async function checkRecoverySession() {
        try {

            const {
                data: {
                    session
                },
                error
            } =
                await supabaseClient.auth
                    .getSession();

            if (error) {
                console.error(
                    "Recovery session error:",
                    error
                );

                showAlert(
                    "Sesi reset password tidak valid atau sudah berakhir.",
                    "error"
                );

                if (resetForm) {
                    resetForm.hidden = true;
                }

                return false;
            }


            if (!session?.user) {

                showAlert(
                    "Link reset password tidak valid atau sudah kedaluwarsa.",
                    "error"
                );

                if (resetForm) {
                    resetForm.hidden = true;
                }

                return false;
            }


            return true;

        } catch (error) {

            console.error(
                "Check recovery session error:",
                error
            );

            showAlert(
                "Sesi reset password tidak dapat diverifikasi.",
                "error"
            );

            if (resetForm) {
                resetForm.hidden = true;
            }

            return false;
        }
    }


    /* =========================================================
       RESET PASSWORD
    ========================================================= */

    if (resetForm) {

        resetForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                hideAlert();

                if (!validateForm()) {
                    showAlert(
                        "Periksa kembali password Anda.",
                        "error"
                    );

                    return;
                }


                const password =
                    passwordInput.value;


                try {

                    setLoading(true);


                    const {
                        data,
                        error
                    } =
                        await supabaseClient.auth
                            .updateUser({
                                password
                            });


                    if (error) {
                        throw error;
                    }


                    if (!data?.user) {
                        throw new Error(
                            "Password gagal diperbarui."
                        );
                    }


                    showAlert(
                        "Password berhasil diperbarui. Mengarahkan ke halaman login...",
                        "success"
                    );


                    resetForm.reset();


                    /*
                     * Beri waktu agar user
                     * melihat pesan sukses.
                     */

                    setTimeout(
                        async () => {

                            await supabaseClient.auth
                                .signOut();

                            window.location.replace(
                                "/login.html"
                            );

                        },
                        1800
                    );


                } catch (error) {

                    console.error(
                        "Reset password error:",
                        error
                    );

                    let message =
                        "Gagal memperbarui password.";

                    const errorMessage =
                        error?.message?.toLowerCase();


                    if (
                        errorMessage?.includes(
                            "same password"
                        )
                    ) {

                        message =
                            "Password baru harus berbeda dari password sebelumnya.";

                    } else if (
                        errorMessage?.includes(
                            "password"
                        )
                    ) {

                        message =
                            error.message;

                    } else if (error?.message) {

                        message =
                            error.message;
                    }


                    showAlert(
                        message,
                        "error"
                    );

                } finally {

                    setLoading(false);

                }
            }
        );
    }


    /* =========================================================
       INITIALIZE
    ========================================================= */

    checkRecoverySession();

});