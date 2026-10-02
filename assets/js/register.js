import { supabaseClient } from "./supabase.js";

/* =========================================================
   IK-Pro.My.Id
   AUTH SYSTEM
   REGISTER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENT
    ===================================================== */

    const registerForm =
        document.getElementById("register-form");

    const nameInput =
        document.getElementById("name");

    const phoneInput =
        document.getElementById("phone");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirm-password");

    const termsInput =
        document.getElementById("terms");


    const nameError =
        document.getElementById("name-error");

    const phoneError =
        document.getElementById("phone-error");

    const emailError =
        document.getElementById("email-error");

    const passwordError =
        document.getElementById("password-error");

    const confirmPasswordError =
        document.getElementById("confirm-password-error");

    const termsError =
        document.getElementById("terms-error");


    const alertBox =
        document.getElementById("auth-alert");


    const submitButton =
        document.getElementById("register-submit");

    const submitText =
        document.getElementById("register-submit-text");

    const loadingText =
        document.getElementById("register-loading");


    const togglePassword =
        document.getElementById("toggle-password");

    const toggleConfirmPassword =
        document.getElementById(
            "toggle-confirm-password"
        );


    /* =====================================================
       ALERT
    ===================================================== */

    function showAlert(
        message,
        type = "error"
    ) {

        if (!alertBox) return;

        alertBox.textContent =
            message;

        alertBox.className =
            `auth-alert auth-alert-${type}`;

        alertBox.hidden = false;
    }


    function hideAlert() {

        if (!alertBox) return;

        alertBox.hidden = true;
        alertBox.textContent = "";
    }


    /* =====================================================
       CLEAR ERRORS
    ===================================================== */

    function clearErrors() {

        const errors = [
            nameError,
            phoneError,
            emailError,
            passwordError,
            confirmPasswordError,
            termsError
        ];


        errors.forEach(error => {

            if (error) {
                error.textContent = "";
            }

        });


        const inputs = [
            nameInput,
            phoneInput,
            emailInput,
            passwordInput,
            confirmPasswordInput
        ];


        inputs.forEach(input => {

            if (input) {
                input.classList.remove(
                    "input-error"
                );
            }

        });

    }


    /* =====================================================
       VALIDATE NAME
    ===================================================== */

    function validateName() {

        const name =
            nameInput.value.trim();


        if (!name) {

            nameError.textContent =
                "Nama lengkap wajib diisi.";

            nameInput.classList.add(
                "input-error"
            );

            return false;
        }


        if (name.length < 3) {

            nameError.textContent =
                "Nama minimal 3 karakter.";

            nameInput.classList.add(
                "input-error"
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       VALIDATE PHONE
    ===================================================== */

    function validatePhone() {

        const phone =
            phoneInput.value.trim();


        if (!phone) {

            phoneError.textContent =
                "Nomor WhatsApp wajib diisi.";

            phoneInput.classList.add(
                "input-error"
            );

            return false;
        }


        /*
         * Format Indonesia:
         * 08xxxxxxxxxx
         * +628xxxxxxxxxx
         */

        const phoneRegex =
            /^(08\d{8,13}|\+628\d{8,13})$/;


        if (!phoneRegex.test(phone)) {

            phoneError.textContent =
                "Format nomor WhatsApp tidak valid.";

            phoneInput.classList.add(
                "input-error"
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       VALIDATE EMAIL
    ===================================================== */

    function validateEmail() {

        const email =
            emailInput.value.trim();


        if (!email) {

            emailError.textContent =
                "Email wajib diisi.";

            emailInput.classList.add(
                "input-error"
            );

            return false;
        }


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(email)) {

            emailError.textContent =
                "Format email tidak valid.";

            emailInput.classList.add(
                "input-error"
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       VALIDATE PASSWORD
    ===================================================== */

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


        return true;
    }


    /* =====================================================
       VALIDATE CONFIRM PASSWORD
    ===================================================== */

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


        if (
            password !==
            confirmPassword
        ) {

            confirmPasswordError.textContent =
                "Konfirmasi password tidak sama.";

            confirmPasswordInput.classList.add(
                "input-error"
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       VALIDATE TERMS
    ===================================================== */

    function validateTerms() {

        if (!termsInput.checked) {

            termsError.textContent =
                "Anda harus menyetujui Syarat & Ketentuan.";

            return false;
        }


        return true;
    }


    /* =====================================================
       VALIDATE FORM
    ===================================================== */

    function validateForm() {

        clearErrors();

        let valid = true;


        if (!validateName()) {
            valid = false;
        }


        if (!validatePhone()) {
            valid = false;
        }


        if (!validateEmail()) {
            valid = false;
        }


        if (!validatePassword()) {
            valid = false;
        }


        if (!validateConfirmPassword()) {
            valid = false;
        }


        if (!validateTerms()) {
            valid = false;
        }


        return valid;
    }


    /* =====================================================
       LOADING STATE
    ===================================================== */

    function setLoading(isLoading) {

        submitButton.disabled =
            isLoading;


        submitText.hidden =
            isLoading;


        loadingText.hidden =
            !isLoading;


        nameInput.disabled =
            isLoading;


        phoneInput.disabled =
            isLoading;


        emailInput.disabled =
            isLoading;


        passwordInput.disabled =
            isLoading;


        confirmPasswordInput.disabled =
            isLoading;


        termsInput.disabled =
            isLoading;

    }


    /* =====================================================
       TOGGLE PASSWORD
    ===================================================== */

    function setupPasswordToggle(
        button,
        input
    ) {

        if (!button || !input) {
            return;
        }


        button.addEventListener(
            "click",
            () => {

                const isPassword =
                    input.type ===
                    "password";


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


    /* =====================================================
       REGISTER
    ===================================================== */

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                hideAlert();


                /* =========================================
                   VALIDASI
                ========================================= */

                if (!validateForm()) {

                    showAlert(
                        "Periksa kembali data yang Anda masukkan.",
                        "error"
                    );

                    return;
                }


                const name =
                    nameInput.value.trim();

                const phone =
                    phoneInput.value.trim();

                const email =
                    emailInput.value
                        .trim()
                        .toLowerCase();

                const password =
                    passwordInput.value;


                try {

                    setLoading(true);


                    /* =====================================
                       SUPABASE SIGN UP
                    ===================================== */

                    const {
                        data,
                        error
                    } =
                        await supabaseClient.auth
                            .signUp({

                                email,

                                password,

                                options: {

                                    data: {
                                        name,
                                        phone
                                    }

                                }

                            });


                    if (error) {
                        throw error;
                    }


                    /* =====================================
                       EMAIL CONFIRMATION
                    ===================================== */

                    if (
                        data.user &&
                        !data.session
                    ) {

                        showAlert(
                            "Pendaftaran berhasil. Silakan cek email Anda untuk melakukan konfirmasi akun.",
                            "success"
                        );


                        registerForm.reset();

                        return;
                    }


                    /* =====================================
                       SESSION LANGSUNG TERSEDIA
                    ===================================== */

                    if (
                        data.user &&
                        data.session
                    ) {

                        showAlert(
                            "Akun berhasil dibuat. Mengarahkan ke dashboard...",
                            "success"
                        );


                        window.location.replace(
                            "/client/index.html"
                        );


                        return;
                    }


                    throw new Error(
                        "Pendaftaran gagal. Data akun tidak ditemukan."
                    );


                } catch (error) {

                    console.error(
                        "Register error:",
                        error
                    );


                    let message =
                        "Terjadi kesalahan saat membuat akun.";


                    const errorMessage =
                        error?.message
                            ?.toLowerCase();


                    if (
                        errorMessage?.includes(
                            "user already registered"
                        )
                    ) {

                        message =
                            "Email tersebut sudah terdaftar.";

                    } else if (
                        errorMessage?.includes(
                            "password should be at least"
                        )
                    ) {

                        message =
                            "Password belum memenuhi ketentuan.";

                    } else if (
                        errorMessage?.includes(
                            "invalid email"
                        )
                    ) {

                        message =
                            "Format email tidak valid.";

                    } else if (
                        error?.message
                    ) {

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

});