const SUPABASE_URL = "https://gqrlyyhtjhsjrdkctfmc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcmx5eWh0amhzanJka2N0Zm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTg5NTEsImV4cCI6MjEwNjQ3NDk1MX0.9G3uddg_QwlXK951ExTqkMplH1_c0_PV073mVcb2caY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = button.parentElement.querySelector("input");

        input.type = input.type === "password" ? "text" : "password";
    });
});

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;

        const password = document.getElementById("loginPassword").value;

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Login berhasil");

        window.location.href = "dashboard.html";
    });
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async e => {
        e.preventDefault();

        const name = document.getElementById("registerName").value;

        const phone = document.getElementById("registerPhone").value;

        const email = document.getElementById("registerEmail").value;

        const password = document.getElementById("registerPassword").value;

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

        if (error) {
            alert(error.message);
            return;
        }

        alert("Pendaftaran berhasil. Silakan cek email verifikasi.");

        window.location.href = "login.html";
    });
}
