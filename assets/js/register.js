
import { supabase } from "./supabase.js";

const form = document.getElementById("registerForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("registerButton");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `form-message ${type}`;
  message.hidden = false;
}

function setLoading(loading) {
  button.disabled = loading;
  button.textContent = loading
    ? "Memproses pendaftaran..."
    : "Daftar Sekarang";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  if (fullName.length < 2) {
    showMessage("Nama lengkap minimal 2 karakter.");
    return;
  }

  if (password.length < 8) {
    showMessage("Password harus minimal 8 karakter.");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Konfirmasi password tidak sama.");
    return;
  }

  setLoading(true);
  message.hidden = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${window.location.origin}/login/`
      }
    });

    if (error) throw error;

    // Nomor telepon disimpan setelah profil tersedia.
    // Jika verifikasi email aktif, sesi mungkin belum tersedia.
    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ phone: phone || null })
        .eq("id", data.user.id);

      if (profileError) {
        console.error("Profil belum berhasil diperbarui:", profileError);
      }

      showMessage(
        "Pendaftaran berhasil. Anda akan diarahkan ke halaman login.",
        "success"
      );

      window.location.assign("/login/");
      return;
    }

    showMessage(
      "Pendaftaran diterima. Periksa email Anda untuk memverifikasi akun sebelum login.",
      "success"
    );

    form.reset();
  } catch (error) {
    console.error("Register error:", error);

    showMessage(
      error.message || "Pendaftaran gagal. Silakan coba lagi."
    );
  } finally {
    setLoading(false);
  }
});
