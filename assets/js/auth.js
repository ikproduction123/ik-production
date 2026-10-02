const SUPABASE_URL = "ISI_URL_SUPABASE";
const SUPABASE_ANON_KEY = "ISI_ANON_KEY_SUPABASE";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

document.querySelectorAll(".toggle-password")
.forEach(button => {

    button.addEventListener("click", () => {

        const input =
            button.parentElement.querySelector("input");

        input.type =
            input.type === "password"
            ? "text"
            : "password";
    });

});

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById("loginEmail").value;

            const password =
                document.getElementById("loginPassword").value;

            const { error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                alert(error.message);
                return;
            }

            alert("Login berhasil");

            window.location.href =
                "dashboard.html";
        }
    );
}

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const name =
                document.getElementById("registerName").value;

            const email =
                document.getElementById("registerEmail").value;

            const password =
                document.getElementById("registerPassword").value;

            const { error } =
                await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name
                        }
                    }
                });

            if (error) {
                alert(error.message);
                return;
            }

            alert(
                "Pendaftaran berhasil. Silakan cek email verifikasi."
            );

            window.location.href =
                "login.html";
        }
    );
}