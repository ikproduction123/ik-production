import { supabase } from '../config/supabase.js';
import { redirectIfAuthenticated } from '../utils/auth-guard.js';
import { showToast } from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  await redirectIfAuthenticated();

  const form = document.getElementById('register-form');
  const btnSubmit = document.getElementById('btn-register');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok', 'error');
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Mendaftarkan...';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone,
          role: 'client'
        }
      }
    });

    if (error) {
      showToast('Pendaftaran gagal: ' + error.message, 'error');
      btnSubmit.disabled = false;
      btnSubmit.innerText = 'Daftar';
      return;
    }

    showToast('Pendaftaran berhasil! Mengalihkan...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard/index.html';
    }, 1200);
  });
});
