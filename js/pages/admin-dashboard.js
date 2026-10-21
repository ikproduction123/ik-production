import { supabase } from '../config/supabase.js';
import { protectPage } from '../utils/auth-guard.js';
import { showToast, formatRupiah } from '../utils/helpers.js';

let currentAdmin = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Protect page: Khusus Role Admin
  currentAdmin = await protectPage('admin');
  if (!currentAdmin) return;

  setupAdminNavigation();
  await loadAdminTransactions();
  await loadAdminThemes();
  await loadAdminPackages();
  await loadAdminMusics();
  await loadAdminQuotes();

  document.getElementById('btn-admin-logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  });
});

// 1. Navigation Tab Admin
function setupAdminNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('admin-page-title');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));

      item.classList.add('active');
      const tabId = item.dataset.tab;
      document.getElementById(`tab-${tabId}`).classList.add('active');
      pageTitle.innerText = item.innerText;
    });
  });
}

// 2. Load & Approve Transaksi Client
async function loadAdminTransactions() {
  const tbody = document.getElementById('admin-transactions-table');
  if (!tbody) return;

  const { data: txs, error } = await supabase
    .from('transactions')
    .select('*, profiles(full_name, phone_number), packages(name, active_duration_days)')
    .order('created_at', { ascending: false });

  if (error || !txs || txs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada transaksi masuk.</td></tr>`;
    return;
  }

  tbody.innerHTML = txs.map(tx => `
    <tr>
      <td>${tx.profiles?.full_name || 'Client'}<br><small>${tx.profiles?.phone_number || ''}</small></td>
      <td>${tx.packages?.name || '-'}</td>
      <td>${formatRupiah(tx.amount)}</td>
      <td>${tx.payment_proof_url ? `<a href="${tx.payment_proof_url}" target="_blank" class="btn-link">Buka Bukti</a>` : '-'}</td>
      <td><span class="badge-status ${tx.status}">${tx.status}</span></td>
      <td>
        ${tx.status === 'pending' ? `
          <button class="btn-primary btn-sm btn-approve" data-id="${tx.id}" data-user="${tx.user_id}" data-pkg="${tx.package_id}" data-days="${tx.packages?.active_duration_days}">Setujui</button>
          <button class="btn-danger btn-sm btn-reject" data-id="${tx.id}">Tolak</button>
        ` : '-'}
      </td>
    </tr>
  `).join('');

  // Event Listener Approve Transaksi
  document.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { id, user, pkg, days } = btn.dataset;
      
      // Update status transaksi
      await supabase.from('transactions').update({ status: 'approved' }).eq('id', id);

      // Tambah / Aktifkan User Subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(days || 365, 10));

      await supabase.from('user_subscriptions').insert({
        user_id: user,
        package_id: pkg,
        transaction_id: id,
        expires_at: expiresAt.toISOString(),
        is_active: true
      });

      showToast('Transaksi disetujui & paket client diaktifkan!', 'success');
      loadAdminTransactions();
    });
  });
}

// 3. Load & Kelola Tema
async function loadAdminThemes() {
  const tbody = document.getElementById('admin-themes-table');
  if (!tbody) return;

  const { data: themes } = await supabase
    .from('themes')
    .select('*, packages(name)')
    .order('created_at', { ascending: false });

  if (!themes || themes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada tema.</td></tr>`;
    return;
  }

  tbody.innerHTML = themes.map(t => `
    <tr>
      <td><img src="${t.thumbnail_url || '/assets/mockups/hero-mockup.png'}" class="thumb-sm"></td>
      <td>${t.theme_name}</td>
      <td>${t.packages?.name || '-'}</td>
      <td>${t.category}</td>
      <td><code>${t.folder_path}</code></td>
      <td><button class="btn-danger btn-sm btn-delete-theme" data-id="${t.id}">Hapus</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-delete-theme').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Yakin ingin menghapus tema ini?')) {
        await supabase.from('themes').delete().eq('id', btn.dataset.id);
        showToast('Tema berhasil dihapus', 'success');
        loadAdminThemes();
      }
    });
  });
}

// 4. Load & Kelola Paket
async function loadAdminPackages() {
  const tbody = document.getElementById('admin-packages-table');
  if (!tbody) return;

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .order('price', { ascending: false });

  tbody.innerHTML = (packages || []).map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.slug}</td>
      <td>${formatRupiah(p.price)}</td>
      <td>${p.max_invitations} Undangan</td>
      <td>${p.active_duration_days} Hari</td>
      <td><button class="btn-secondary btn-sm btn-edit-pkg" data-id="${p.id}">Edit Paket</button></td>
    </tr>
  `).join('');
}

// 5. Load & Kelola Musik Backsound
async function loadAdminMusics() {
  const tbody = document.getElementById('admin-musics-table');
  if (!tbody) return;

  const { data: musics } = await supabase.from('musics').select('*');

  tbody.innerHTML = (musics || []).map(m => `
    <tr>
      <td>${m.title}</td>
      <td>${m.artist}</td>
      <td><audio controls src="${m.audio_url}" class="audio-preview-sm"></audio></td>
      <td><button class="btn-danger btn-sm btn-delete-music" data-id="${m.id}">Hapus</button></td>
    </tr>
  `).join('');
}

// 6. Load & Kelola Quotes
async function loadAdminQuotes() {
  const tbody = document.getElementById('admin-quotes-table');
  if (!tbody) return;

  const { data: quotes } = await supabase.from('quotes').select('*');

  tbody.innerHTML = (quotes || []).map(q => `
    <tr>
      <td>"${q.content}"</td>
      <td>${q.source}</td>
      <td>${q.category}</td>
      <td><button class="btn-danger btn-sm btn-delete-quote" data-id="${q.id}">Hapus</button></td>
    </tr>
  `).join('');
}
