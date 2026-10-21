import { supabase } from '../config/supabase.js';
import { protectPage } from '../utils/auth-guard.js';
import { showToast, formatRupiah, formatDateShort } from '../utils/helpers.js';

let currentUser = null;

// Tambahkan panggilan setupModalInvitation() di dalam DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await protectPage('client');
  if (!currentUser) return;

  setupUI();
  setupNavigation();
  setupModalInvitation(); // <-- Panggil di sini

  await loadOverviewData();
  await loadClientInvitations();
  await loadClientPackages();
  await loadClientTransactions();
  await loadRSVPData();
});

function setupModalInvitation() {
  const modal = document.getElementById('modal-invitation');
  const btnCreate = document.getElementById('btn-create-invitation');
  const btnClose = document.getElementById('close-invitation-modal');
  const selectTheme = document.getElementById('inv-theme-id');

  // Open Modal & Load Available Themes
  btnCreate?.addEventListener('click', async () => {
    // 1. Cek kuota / Paket Aktif Client
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('*, packages(*)')
      .eq('user_id', currentUser.id)
      .eq('is_active', true)
      .single();

    if (!sub) {
      showToast('Anda belum memiliki paket aktif! Silakan pilih & aktifkan paket dahulu.', 'error');
      return;
    }

    // 2. Load daftar tema berdasarkan paket aktif client
    const { data: themes } = await supabase
      .from('themes')
      .select('*')
      .eq('package_id', sub.package_id)
      .eq('is_active', true);

    if (!themes || themes.length === 0) {
      showToast('Belum ada tema tersedia untuk paket Anda.', 'error');
      return;
    }

    selectTheme.innerHTML = themes.map(t => `<option value="${t.id}">${t.theme_name}</option>`).join('');
    modal.classList.add('show');
  });

  btnClose?.addEventListener('click', () => modal.classList.remove('show'));

  // Submit Handler Buat Undangan Baru
  document.getElementById('form-create-invitation')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btn-save-invitation');
    btnSave.disabled = true;
    btnSave.innerText = 'Menyimpan Undangan...';

    try {
      const themeId = selectTheme.value;
      const title = document.getElementById('inv-title').value.trim();
      const slug = document.getElementById('inv-slug').value.trim().toLowerCase().replace(/\s+/g, '-');
      const eventDate = document.getElementById('inv-date').value;

      // 1. Insert Data Utama Undangan
      const { data: newInv, error: invErr } = await supabase
        .from('invitations')
        .insert([{
          user_id: currentUser.id,
          theme_id: themeId,
          slug: slug,
          title: title,
          meta_title: title,
          meta_description: `Undangan Pernikahan Online - ${title}`,
          event_date: new Date(eventDate).toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (invErr) throw new Error('Gagal membuat undangan (Slug mungkin sudah digunakan): ' + invErr.message);

      // 2. Insert Data Mempelai Pria & Wanita
      await supabase.from('invitation_couples').insert([
        {
          invitation_id: newInv.id,
          gender: 'groom',
          full_name: document.getElementById('groom-full-name').value.trim(),
          short_name: document.getElementById('groom-short-name').value.trim(),
          father_name: document.getElementById('groom-father').value.trim(),
          mother_name: document.getElementById('groom-mother').value.trim()
        },
        {
          invitation_id: newInv.id,
          gender: 'bride',
          full_name: document.getElementById('bride-full-name').value.trim(),
          short_name: document.getElementById('bride-short-name').value.trim(),
          father_name: document.getElementById('bride-father').value.trim(),
          mother_name: document.getElementById('bride-mother').value.trim()
        }
      ]);

      // 3. Insert Detail Acara
      await supabase.from('invitation_events').insert([{
        invitation_id: newInv.id,
        event_title: document.getElementById('event-title').value.trim(),
        event_date: eventDate,
        start_time: document.getElementById('event-time').value.trim(),
        venue_name: document.getElementById('event-venue').value.trim(),
        address: document.getElementById('event-address').value.trim()
      }]);

      showToast('Undangan berhasil dibuat!', 'success');
      modal.classList.remove('show');
      e.target.reset();

      await loadClientInvitations();
      await loadOverviewData();

    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnSave.disabled = false;
      btnSave.innerText = 'Buat & Simpan Undangan';
    }
  });
}
