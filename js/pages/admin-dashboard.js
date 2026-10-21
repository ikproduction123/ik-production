import { supabase } from "../config/supabase.js";
import { protectPage } from "../utils/auth-guard.js";
import { showToast, formatRupiah } from "../utils/helpers.js";

let currentAdmin = null;

document.addEventListener("DOMContentLoaded", async () => {
    currentAdmin = await protectPage("admin");
    if (!currentAdmin) return;

    setupAdminNavigation();
    setupModalHandlers();

    await loadAdminTransactions();
    await loadAdminThemes();
    await loadAdminPackages();
    await loadAdminMusics();
    await loadAdminQuotes();

    document
        .getElementById("btn-admin-logout")
        ?.addEventListener("click", async () => {
            await supabase.auth.signOut();
            window.location.href = "/login.html";
        });
});

// 1. Navigation Tabs
function setupAdminNavigation() {
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    const tabContents = document.querySelectorAll(".tab-content");
    const pageTitle = document.getElementById("admin-page-title");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            tabContents.forEach(t => t.classList.remove("active"));

            item.classList.add("active");
            const tabId = item.dataset.tab;
            document.getElementById(`tab-${tabId}`)?.classList.add("active");
            if (pageTitle) pageTitle.innerText = item.innerText;
        });
    });
}

// 2. Modals Control & Submit Handlers
function setupModalHandlers() {
    const modalTheme = document.getElementById("modal-theme");
    const modalMusic = document.getElementById("modal-music");
    const modalQuote = document.getElementById("modal-quote");

    document
        .getElementById("btn-open-modal-theme")
        ?.addEventListener("click", () => modalTheme.classList.add("show"));
    document
        .getElementById("btn-open-modal-music")
        ?.addEventListener("click", () => modalMusic.classList.add("show"));
    document
        .getElementById("btn-open-modal-quote")
        ?.addEventListener("click", () => modalQuote.classList.add("show"));

    document
        .getElementById("close-theme-modal")
        ?.addEventListener("click", () => modalTheme.classList.remove("show"));
    document
        .getElementById("close-music-modal")
        ?.addEventListener("click", () => modalMusic.classList.remove("show"));
    document
        .getElementById("close-quote-modal")
        ?.addEventListener("click", () => modalQuote.classList.remove("show"));

// Handler Submit Form Tambah Tema (Gantikan kode lama di js/pages/admin-dashboard.js)
document.getElementById('form-add-theme')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const themeName = document.getElementById('theme-name').value.trim();
  const themeSlug = document.getElementById('theme-slug').value.trim();
  const packageId = document.getElementById('theme-package-id').value;
  const category = document.getElementById('theme-category').value;
  const folderPath = document.getElementById('theme-folder-path').value.trim();
  const imageFile = document.getElementById('theme-thumbnail-file').files[0];

  if (!imageFile) {
    showToast('Silakan pilih file gambar thumbnail!', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = 'Mengunggah Gambar...';

  // 1. Upload File Gambar ke Supabase Storage (invitation-assets)
  const fileExt = imageFile.name.split('.').pop();
  const fileName = `themes/thumb_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('invitation-assets')
    .upload(fileName, imageFile, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    showToast('Gagal mengunggah thumbnail: ' + uploadError.message, 'error');
    submitBtn.disabled = false;
    submitBtn.innerText = 'Simpan Tema';
    return;
  }

  // 2. Dapatkan Public URL Gambar yang Diunggah
  const { data: publicUrlData } = supabase.storage
    .from('invitation-assets')
    .getPublicUrl(fileName);

  // 3. Simpan Data Tema ke Database Supabase
  const payload = {
    theme_name: themeName,
    theme_slug: themeSlug,
    package_id: packageId,
    category: category,
    folder_path: folderPath,
    thumbnail_url: publicUrlData.publicUrl,
  };

  const { error: dbError } = await supabase.from('themes').insert([payload]);

  if (dbError) {
    showToast('Gagal menyimpan data tema: ' + dbError.message, 'error');
    submitBtn.disabled = false;
    submitBtn.innerText = 'Simpan Tema';
    return;
  }

  showToast('Tema dan thumbnail berhasil disimpan!', 'success');
  document.getElementById('modal-theme').classList.remove('show');
  submitBtn.disabled = false;
  submitBtn.innerText = 'Simpan Tema';
  e.target.reset();
  
  await loadAdminThemes();
});


    // Handler Submit Upload Musik ke Supabase Storage (audio-library)
    document
        .getElementById("form-add-music")
        ?.addEventListener("submit", async e => {
            e.preventDefault();
            const btn = document.getElementById("btn-save-music");
            const title = document.getElementById("music-title").value.trim();
            const artist = document.getElementById("music-artist").value.trim();
            const file = document.getElementById("music-file").files[0];

            if (!file) return;
            btn.disabled = true;
            btn.innerText = "Uploading...";

            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("audio-library")
                .upload(fileName, file);

            if (uploadError) {
                showToast(
                    "Gagal upload audio: " + uploadError.message,
                    "error"
                );
                btn.disabled = false;
                btn.innerText = "Upload & Simpan";
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("audio-library")
                .getPublicUrl(fileName);

            await supabase
                .from("musics")
                .insert([
                    { title, artist, audio_url: publicUrlData.publicUrl }
                ]);

            showToast("Musik berhasil ditambahkan!", "success");
            modalMusic.classList.remove("show");
            btn.disabled = false;
            btn.innerText = "Upload & Simpan";
            e.target.reset();
            await loadAdminMusics();
        });

    // Handler Submit Tambah Quote
    document
        .getElementById("form-add-quote")
        ?.addEventListener("submit", async e => {
            e.preventDefault();
            const content = document
                .getElementById("quote-content")
                .value.trim();
            const source = document.getElementById("quote-source").value.trim();

            const { error } = await supabase
                .from("quotes")
                .insert([{ content, source }]);
            if (error)
                return showToast(
                    "Gagal menyimpan quote: " + error.message,
                    "error"
                );

            showToast("Quote berhasil ditambahkan!", "success");
            modalQuote.classList.remove("show");
            e.target.reset();
            await loadAdminQuotes();
        });
}

// 3. Transactions Verification
async function loadAdminTransactions() {
    const tbody = document.getElementById("admin-transactions-table");
    if (!tbody) return;

    const { data: txs } = await supabase
        .from("transactions")
        .select(
            "*, profiles(full_name, phone_number), packages(name, active_duration_days)"
        )
        .order("created_at", { ascending: false });

    if (!txs || txs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada transaksi.</td></tr>`;
        return;
    }

    tbody.innerHTML = txs
        .map(
            tx => `
    <tr>
      <td>${tx.profiles?.full_name || "Client"}<br><small>${tx.profiles?.phone_number || ""}</small></td>
      <td>${tx.packages?.name || "-"}</td>
      <td>${formatRupiah(tx.amount)}</td>
      <td>${tx.payment_proof_url ? `<a href="${tx.payment_proof_url}" target="_blank">Lihat Bukti</a>` : "-"}</td>
      <td><span class="badge-status ${tx.status}">${tx.status}</span></td>
      <td>
        ${
            tx.status === "pending"
                ? `
          <button class="btn-primary btn-sm btn-approve" data-id="${tx.id}" data-user="${tx.user_id}" data-pkg="${tx.package_id}" data-days="${tx.packages?.active_duration_days}">Setujui</button>
          <button class="btn-danger btn-sm btn-reject" data-id="${tx.id}">Tolak</button>
        `
                : "-"
        }
      </td>
    </tr>
  `
        )
        .join("");

    document.querySelectorAll(".btn-approve").forEach(btn => {
        btn.addEventListener("click", async () => {
            const { id, user, pkg, days } = btn.dataset;
            await supabase
                .from("transactions")
                .update({ status: "approved" })
                .eq("id", id);

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(days || 365, 10));

            await supabase.from("user_subscriptions").insert({
                user_id: user,
                package_id: pkg,
                transaction_id: id,
                expires_at: expiresAt.toISOString(),
                is_active: true
            });

            showToast("Transaksi disetujui & paket aktif!", "success");
            loadAdminTransactions();
        });
    });

    document.querySelectorAll(".btn-reject").forEach(btn => {
        btn.addEventListener("click", async () => {
            await supabase
                .from("transactions")
                .update({ status: "rejected" })
                .eq("id", btn.dataset.id);
            showToast("Transaksi ditolak", "error");
            loadAdminTransactions();
        });
    });
}

// 4. Load Themes & Package Options
async function loadAdminThemes() {
    const tbody = document.getElementById("admin-themes-table");
    const selectPkg = document.getElementById("theme-package-id");
    if (!tbody) return;

    const [{ data: themes }, { data: packages }] = await Promise.all([
        supabase
            .from("themes")
            .select("*, packages(name)")
            .order("created_at", { ascending: false }),
        supabase.from("packages").select("id, name")
    ]);

    if (selectPkg && packages) {
        selectPkg.innerHTML = packages
            .map(p => `<option value="${p.id}">${p.name}</option>`)
            .join("");
    }

    if (!themes || themes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada tema.</td></tr>`;
        return;
    }

    tbody.innerHTML = themes
        .map(
            t => `
    <tr>
      <td><img src="${t.thumbnail_url || "/assets/mockups/hero-mockup.png"}" class="thumb-sm"></td>
      <td>${t.theme_name}</td>
      <td>${t.packages?.name || "-"}</td>
      <td>${t.category}</td>
      <td><code>${t.folder_path}</code></td>
      <td><button class="btn-danger btn-sm btn-delete-theme" data-id="${t.id}">Hapus</button></td>
    </tr>
  `
        )
        .join("");

    document.querySelectorAll(".btn-delete-theme").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (confirm("Yakin hapus tema ini?")) {
                await supabase.from("themes").delete().eq("id", btn.dataset.id);
                showToast("Tema dihapus", "success");
                loadAdminThemes();
            }
        });
    });
}

// 5. Load Packages
async function loadAdminPackages() {
    const tbody = document.getElementById("admin-packages-table");
    if (!tbody) return;

    const { data: packages } = await supabase
        .from("packages")
        .select("*")
        .order("price", { ascending: false });

    tbody.innerHTML = (packages || [])
        .map(
            p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.slug}</td>
      <td>${formatRupiah(p.price)}</td>
      <td>${p.max_invitations} Undangan</td>
      <td>${p.active_duration_days} Hari</td>
      <td><button class="btn-secondary btn-sm">Edit</button></td>
    </tr>
  `
        )
        .join("");
}

// 6. Load Musics
async function loadAdminMusics() {
    const tbody = document.getElementById("admin-musics-table");
    if (!tbody) return;

    const { data: musics } = await supabase.from("musics").select("*");

    tbody.innerHTML = (musics || [])
        .map(
            m => `
    <tr>
      <td>${m.title}</td>
      <td>${m.artist}</td>
      <td><audio controls src="${m.audio_url}" class="audio-preview-sm"></audio></td>
      <td><button class="btn-danger btn-sm btn-delete-music" data-id="${m.id}">Hapus</button></td>
    </tr>
  `
        )
        .join("");

    document.querySelectorAll(".btn-delete-music").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (confirm("Hapus musik ini?")) {
                await supabase.from("musics").delete().eq("id", btn.dataset.id);
                showToast("Musik dihapus", "success");
                loadAdminMusics();
            }
        });
    });
}

// 7. Load Quotes
async function loadAdminQuotes() {
    const tbody = document.getElementById("admin-quotes-table");
    if (!tbody) return;

    const { data: quotes } = await supabase.from("quotes").select("*");

    tbody.innerHTML = (quotes || [])
        .map(
            q => `
    <tr>
      <td>"${q.content}"</td>
      <td>${q.source}</td>
      <td>${q.category}</td>
      <td><button class="btn-danger btn-sm btn-delete-quote" data-id="${q.id}">Hapus</button></td>
    </tr>
  `
        )
        .join("");

    document.querySelectorAll(".btn-delete-quote").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (confirm("Hapus quote ini?")) {
                await supabase.from("quotes").delete().eq("id", btn.dataset.id);
                showToast("Quote dihapus", "success");
                loadAdminQuotes();
            }
        });
    });
}
