
import { supabase } from "./supabase.js";

const form = document.getElementById("resetForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("resetButton");

let recoverySessionReady = false;

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `form-message ${type}`;
  message.hidden = false;
}

function setLoading(loading) {
  button.disabled = loading;
  button.textContent = loading
    ? "Menyimpan..."
    : "Simpan Password Baru";
}

async function checkRecoverySession() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    showMessage(
      "Tautan pemulihan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru dari halaman Lupa Password."
    );
    return;
  }

  recoverySessionReady = true;
  form.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!recoverySessionReady) {
    showMessage("Sesi pemulihan tidak tersedia. Minta tautan baru.");
    return;
  }

  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

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
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;

    // Tutup sesi pemulihan setelah password berhasil diganti.
    await supabase.auth.signOut();

    recoverySessionReady = false;
    form.hidden = true;

    showMessage(
      "Password berhasil diperbarui. Silakan login dengan password baru.",
      "success"
    );

    const link = document.createElement("a");
    link.href = "/login/";
    link.textContent = "Masuk sekarang";
    link.className = "back-home";
    message.insertAdjacentElement("afterend", link);
  } catch (error) {
    console.error("Password update error:", error);
    showMessage(
      error.message || "Password gagal diperbarui. Coba minta tautan baru."
    );
  } finally {
    setLoading(false);
  }
});

checkRecoverySession();
