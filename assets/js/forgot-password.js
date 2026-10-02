import { supabaseClient } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    const forgotForm = document.getElementById("forgot-password-form");

    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email-error");

    const alertBox = document.getElementById("auth-alert");

    const submitButton = document.getElementById(
        "forgot-password-submit"
    );

    const submitText = document.getElementById(
        "forgot-password-submit-text"
    );

    const loadingText = document.getElementById(
        "forgot-password-loading"
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
        if (emailError) {
            emailError.textContent = "";
        }

        if (emailInput) {
            emailInput.classList.remove("input-error");
        }
    }


    /* =========================================================
       VALIDATION
    ========================================================= */

    function validateEmail() {
        clearErrors();

        const email = emailInput.value.trim();

        if (!email) {
            emailError.textContent =
                "Email wajib diisi.";

            emailInput.classList.add("input-error");

            return false;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            emailError.textContent =
                "Format email tidak valid.";

            emailInput.classList.add("input-error");

            return false;
        }

        return true;
    }


    /* =========================================================
       LOADING
    ========================================================= */

    function setLoading(isLoading) {
        if (!submitButton) return;

        submitButton.disabled = isLoading;

        if (submitText) {
            submitText.hidden = isLoading;
        }

        if (loadingText) {
            loadingText.hidden = !isLoading;
        }

        if (emailInput) {
            emailInput.disabled = isLoading;
        }
    }


    /* =========================================================
       SUBMIT
    ========================================================= */

    if (forgotForm) {
        forgotForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                hideAlert();

                if (!validateEmail()) {
                    return;
                }

                const email =
                    emailInput.value
                        .trim()
                        .toLowerCase();

                try {

                    setLoading(true);

                    const {
                        error
                    } =
                        await supabaseClient.auth
                            .resetPasswordForEmail(
                                email,
                                {
                                    redirectTo:
                                        `${window.location.origin}/reset-password.html`
                                }
                            );

                    if (error) {
                        throw error;
                    }


                    /*
                     * Jangan memberitahu apakah email
                     * benar-benar terdaftar atau tidak.
                     *
                     * Ini mencegah user enumeration.
                     */

                    showAlert(
                        "Jika email tersebut terdaftar, link reset password telah dikirim. Silakan periksa inbox atau folder spam.",
                        "success"
                    );

                    forgotForm.reset();

                } catch (error) {

                    console.error(
                        "Forgot password error:",
                        error
                    );

                    let message =
                        "Terjadi kesalahan. Silakan coba lagi.";

                    const errorMessage =
                        error?.message?.toLowerCase();

                    if (
                        errorMessage?.includes(
                            "rate limit"
                        )
                    ) {
                        message =
                            "Terlalu banyak permintaan. Silakan coba lagi nanti.";
                    } else if (
                        errorMessage?.includes(
                            "invalid email"
                        )
                    ) {
                        message =
                            "Format email tidak valid.";
                    } else if (error?.message) {
                        message = error.message;
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
});