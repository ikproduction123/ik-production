import { supabase } from '../config/supabase.js';
import { showToast } from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const forgotForm = document.getElementById('forgot-form');
  const resetForm = document.getElementById('reset-form');

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const btn = document.getElementById('btn-forgot');

      btn.disabled = true;
      btn.innerText = 'Sending...';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`
      });

      if (error) {
        showToast('Gagal mengirim email: ' + error.message, 'error');
        btn.disabled = false;
        btn.innerText = 'Kirim Link Reset';
        return;
      }

      showToast('Link reset kata sandi telah dikirim ke email Anda!', 'success');
      btn.innerText = 'Terkirim';
    });
  }

  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new-password').value;
      const btn = document.getElementById('btn-reset');

      btn.disabled = true;
      btn.innerText = 'Memperbarui...';

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        showToast('Gagal mengubah kata sandi: ' + error.message, 'error');
        btn.disabled = false;
        btn.innerText = 'Simpan Kata Sandi';
        return;
      }

      showToast('Kata sandi berhasil diperbarui! Silakan login.', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
    });
  }
});
