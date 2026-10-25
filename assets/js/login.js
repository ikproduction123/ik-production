
import { supabase } from "./supabase.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("loginButton");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `form-message ${type}`;
  message.hidden = false;
}

function setLoading(loading) {
  button.disabled = loading;
  button.textContent = loading ? "Memeriksa akun..." : "Masuk";
}

async function redirectByRole(userId) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error(
      "Profil akun tidak ditemukan. Silakan hubungi administrator."
    );
  }

  if (profile.role === "admin") {
    window.location.replace("/admin/");
  } else {
    window.location.replace("/dashboard/");
  }
}

// Jika sudah login, langsung arahkan ke dashboard.
async function checkExistingSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) return;

  if (data.session?.user) {
    try {
      await redirectByRole(data.session.user.id);
    } catch (error) {
      showMessage(error.message);
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;

  setLoading(true);
  message.hidden = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error("Email atau password salah, atau akun belum dapat digunakan.");
    }

    if (!data.user) {
      throw new Error("Login belum berhasil. Silakan coba lagi.");
    }

    await redirectByRole(data.user.id);
  } catch (error) {
    showMessage(error.message || "Terjadi kesalahan saat login.");
  } finally {
    setLoading(false);
  }
});

checkExistingSession();
