import { supabase } from '../config/supabase.js';
import { redirectIfAuthenticated } from '../utils/auth-guard.js';
import { showToast } from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  await redirectIfAuthenticated();

  const form = document.getElementById('login-form');
  const btnSubmit = document.getElementById('btn-login');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Memproses...';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast('Gagal masuk: ' + error.message, 'error');
      btnSubmit.disabled = false;
      btnSubmit.innerText = 'Masuk';
      return;
    }

    showToast('Berhasil masuk!', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard/index.html';
    }, 1000);
  });
});
