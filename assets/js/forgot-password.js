
import { supabase } from "./supabase.js";

const form = document.getElementById("forgotForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("forgotButton");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `form-message ${type}`;
  message.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = form.email.value.trim();

  button.disabled = true;
  button.textContent = "Mengirim...";
  message.hidden = true;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password/`
      }
    );

    if (error) throw error;

    showMessage(
      "Jika email tersebut terdaftar, tautan pemulihan akan dikirim. Periksa inbox dan folder spam.",
      "success"
    );
  } catch (error) {
    console.error("Password recovery error:", error);
    showMessage(
      "Permintaan belum dapat diproses. Periksa koneksi dan coba lagi."
    );
  } finally {
    button.disabled = false;
    button.textContent = "Kirim Tautan Pemulihan";
  }
});
