import { supabase } from "../config/supabase.js";
import { protectPage } from "../utils/auth-guard.js";
import { showToast, formatRupiah, formatDateShort } from "../utils/helpers.js";

let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
    // Protect page: Khusus Client
    currentUser = await protectPage("client");
    if (!currentUser) return;

    setupUI();
    setupNavigation();
    await loadOverviewData();
    await loadClientInvitations();
    await loadClientPackages();
    await loadClientTransactions();
    await loadRSVPData();
});

function setupUI() {
    document.getElementById("header-username").innerText =
        currentUser.profile?.full_name || "Client";
    if (currentUser.profile?.avatar_url) {
        document.getElementById("header-avatar").src =
            currentUser.profile.avatar_url;
    }

    document.getElementById("profile-name").value =
        currentUser.profile?.full_name || "";
    document.getElementById("profile-phone").value =
        currentUser.profile?.phone_number || "";
    document.getElementById("profile-avatar").value =
        currentUser.profile?.avatar_url || "";

    document
        .getElementById("btn-logout")
        .addEventListener("click", async () => {
            await supabase.auth.signOut();
            window.location.href = "/login.html";
        });
}

// 1. Navigation Tab
function setupNavigation() {
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    const tabContents = document.querySelectorAll(".tab-content");
    const pageTitle = document.getElementById("page-title");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            tabContents.forEach(t => t.classList.remove("active"));

            item.classList.add("active");
            const tabId = item.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add("active");
            pageTitle.innerText = item.innerText;
        });
    });
}

// 2. Load Overview Metrics
async function loadOverviewData() {
    const { data: invitations } = await supabase
        .from("invitations")
        .select("id")
        .eq("user_id", currentUser.id);

    const totalInv = invitations?.length || 0;
    document.getElementById("overview-total-invitations").innerText = totalInv;

    if (totalInv > 0) {
        const invIds = invitations.map(i => i.id);
        const { data: rsvps } = await supabase
            .from("rsvps_and_wishes")
            .select("pax_count, message")
            .in("invitation_id", invIds);

        const totalWishes = rsvps?.filter(r => r.message).length || 0;
        const totalGuests =
            rsvps?.reduce((acc, c) => acc + (c.pax_count || 1), 0) || 0;

        document.getElementById("overview-total-wishes").innerText =
            totalWishes;
        document.getElementById("overview-total-guests").innerText =
            totalGuests;
    }
}

// 3. Load Client Invitations
async function loadClientInvitations() {
    const container = document.getElementById("invitations-list");
    if (!container) return;

    const { data: list, error } = await supabase
        .from("invitations")
        .select("*, themes(theme_name, thumbnail_url)")
        .eq("user_id", currentUser.id);

    if (error || !list || list.length === 0) {
        container.innerHTML = `<p class="empty-text">Belum ada undangan yang dibuat. Klik tombol "+ Buat Undangan Baru" di atas.</p>`;
        return;
    }

    container.innerHTML = list
        .map(
            inv => `
    <div class="invitation-card">
      <img src="${inv.cover_photo_url || inv.themes?.thumbnail_url || "/assets/mockups/hero-mockup.png"}" alt="Cover">
      <div class="inv-card-body">
        <h4>${inv.title}</h4>
        <p class="slug-text">ik-pro.my.id/${inv.slug}</p>
        <p class="event-date">Tanggal: ${formatDateShort(inv.event_date)}</p>
        <div class="inv-card-actions">
          <a href="/${inv.slug}" target="_blank" class="btn-outline btn-sm">Lihat Link</a>
          <button class="btn-secondary btn-sm btn-edit-inv" data-id="${inv.id}">Edit Data</button>
          <button class="btn-danger btn-sm btn-delete-inv" data-id="${inv.id}">Hapus</button>
        </div>
      </div>
    </div>
  `
        )
        .join("");
}

// Tambahkan panggilan fungsi ini di dalam event listener DOMContentLoaded:
// await loadClientPackages();

async function loadClientPackages() {
    const container = document.getElementById("client-packages-list");
    if (!container) return;

    // 1. Fetch paket aktif milik user dari subscription
    const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("*, packages(*)")
        .eq("user_id", currentUser.id)
        .eq("is_active", true)
        .single();

    // 2. Fetch seluruh katalog paket dari Supabase
    const { data: packages, error } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

    if (error || !packages) {
        container.innerHTML =
            '<p class="empty-text">Gagal memuat daftar paket.</p>';
        return;
    }

    // Tampilkan banner status paket aktif saat ini
    const banner = document.getElementById("subscription-status-banner");
    if (banner) {
        if (sub && sub.packages) {
            banner.innerHTML = `
        <div class="stat-card" style="border-left: 4px solid var(--accent-gold);">
          <h4>Paket Aktif Anda</h4>
          <p class="stat-value" style="font-size:20px;">${sub.packages.name}</p>
          <small>Berlaku hingga: ${formatDateShort(sub.expires_at)}</small>
        </div>
      `;
        } else {
            banner.innerHTML = `
        <div class="stat-card" style="border-left: 4px solid #D32F2F;">
          <h4>Status Langganan</h4>
          <p class="stat-value" style="font-size:18px; color:#D32F2F;">Belum Memiliki Paket Aktif</p>
          <small>Pilih paket di bawah dan lakukan pembayaran untuk mengaktifkan fitur.</small>
        </div>
      `;
        }
    }

    // Render kartu pilihan paket
    container.innerHTML = packages
        .map(pkg => {
            const isCurrentPkg = sub?.package_id === pkg.id;
            return `
      <div class="harga-card" style="background:#FFF; padding:20px; border-radius:8px; border:1px solid #E2E8F0;">
        <h3>${pkg.name} ${isCurrentPkg ? '<span class="badge-status approved">Aktif</span>' : ""}</h3>
        <div class="price" style="font-size:24px; font-weight:700; color:var(--accent-gold); margin:8px 0;">
          ${formatRupiah(pkg.price)}
        </div>
        <p><small>Masa aktif ${pkg.active_duration_days} Hari • Max ${pkg.max_invitations} Undangan</small></p>
        <button class="btn-primary btn-full btn-order-package" 
                style="margin-top:16px;" 
                data-id="${pkg.id}" 
                data-price="${pkg.price}" 
                ${isCurrentPkg ? "disabled" : ""}>
          ${isCurrentPkg ? "Paket Saat Ini" : "Pilih / Buy Paket"}
        </button>
      </div>
    `;
        })
        .join("");

    // Event Listener Klik Beli/Upgrade Paket (Upload Bukti Transfer)
    document.querySelectorAll(".btn-order-package").forEach(btn => {
        btn.addEventListener("click", async () => {
            const packageId = btn.dataset.id;
            const amount = btn.dataset.price;

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";

            fileInput.onchange = async e => {
                const file = e.target.files[0];
                if (!file) return;

                showToast("Mengunggah bukti pembayaran...", "info");

                // Upload bukti bayar ke storage
                const fileName = `payment_${currentUser.id}_${Date.now()}.${file.name.split(".").pop()}`;
                const { error: uploadErr } = await supabase.storage
                    .from("payment-proofs")
                    .upload(fileName, file);

                if (uploadErr) {
                    showToast(
                        "Gagal upload bukti: " + uploadErr.message,
                        "error"
                    );
                    return;
                }

                const { data: publicUrl } = supabase.storage
                    .from("payment-proofs")
                    .getPublicUrl(fileName);

                // Simpan transaksi status pending
                const { error: txErr } = await supabase
                    .from("transactions")
                    .insert([
                        {
                            user_id: currentUser.id,
                            package_id: packageId,
                            amount: parseFloat(amount),
                            payment_proof_url: publicUrl.publicUrl,
                            status: "pending"
                        }
                    ]);

                if (txErr) {
                    showToast(
                        "Gagal membuat transaksi: " + txErr.message,
                        "error"
                    );
                    return;
                }

                showToast(
                    "Transaksi berhasil dikirim! Menunggu verifikasi Admin.",
                    "success"
                );
                await loadClientTransactions();
            };

            fileInput.click();
        });
    });
}

// 4. Load Transactions History
async function loadClientTransactions() {
    const tbody = document.getElementById("transaction-history-table");
    if (!tbody) return;

    const { data: txs } = await supabase
        .from("transactions")
        .select("*, packages(name)")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

    if (!txs || txs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada riwayat transaksi.</td></tr>`;
        return;
    }

    tbody.innerHTML = txs
        .map(
            tx => `
    <tr>
      <td>${formatDateShort(tx.created_at)}</td>
      <td>${tx.packages?.name || "-"}</td>
      <td>${formatRupiah(tx.amount)}</td>
      <td><span class="badge-status ${tx.status}">${tx.status}</span></td>
      <td>${tx.payment_proof_url ? `<a href="${tx.payment_proof_url}" target="_blank">Lihat Bukti</a>` : "-"}</td>
    </tr>
  `
        )
        .join("");
}

// 5. Load RSVPs Data
async function loadRSVPData() {
    const select = document.getElementById("rsvp-invitation-select");
    const tbody = document.getElementById("client-rsvp-table");
    if (!select || !tbody) return;

    const { data: invitations } = await supabase
        .from("invitations")
        .select("id, title")
        .eq("user_id", currentUser.id);

    if (!invitations || invitations.length === 0) return;

    select.innerHTML =
        '<option value="">-- Pilih Undangan --</option>' +
        invitations
            .map(i => `<option value="${i.id}">${i.title}</option>`)
            .join("");

    select.addEventListener("change", async () => {
        const invId = select.value;
        if (!invId) {
            tbody.innerHTML = "";
            return;
        }

        const { data: rsvps } = await supabase
            .from("rsvps_and_wishes")
            .select("*")
            .eq("invitation_id", invId)
            .order("created_at", { ascending: false });

        if (!rsvps || rsvps.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada konfirmasi RSVP/ucapan.</td></tr>`;
            return;
        }

        tbody.innerHTML = rsvps
            .map(
                r => `
      <tr>
        <td>${r.guest_name}</td>
        <td>${r.attendance_status}</td>
        <td>${r.pax_count}</td>
        <td>${r.message}</td>
        <td>${formatDateShort(r.created_at)}</td>
      </tr>
    `
            )
            .join("");

        // Tambahkan panggilan setupModalInvitation() di dalam DOMContentLoaded
        document.addEventListener("DOMContentLoaded", async () => {
            currentUser = await protectPage("client");
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
            const modal = document.getElementById("modal-invitation");
            const btnCreate = document.getElementById("btn-create-invitation");
            const btnClose = document.getElementById("close-invitation-modal");
            const selectTheme = document.getElementById("inv-theme-id");

            // Open Modal & Load Available Themes
            btnCreate?.addEventListener("click", async () => {
                // 1. Cek kuota / Paket Aktif Client
                const { data: sub } = await supabase
                    .from("user_subscriptions")
                    .select("*, packages(*)")
                    .eq("user_id", currentUser.id)
                    .eq("is_active", true)
                    .single();

                if (!sub) {
                    showToast(
                        "Anda belum memiliki paket aktif! Silakan pilih & aktifkan paket dahulu.",
                        "error"
                    );
                    return;
                }

                // 2. Load daftar tema berdasarkan paket aktif client
                const { data: themes } = await supabase
                    .from("themes")
                    .select("*")
                    .eq("package_id", sub.package_id)
                    .eq("is_active", true);

                if (!themes || themes.length === 0) {
                    showToast(
                        "Belum ada tema tersedia untuk paket Anda.",
                        "error"
                    );
                    return;
                }

                selectTheme.innerHTML = themes
                    .map(
                        t => `<option value="${t.id}">${t.theme_name}</option>`
                    )
                    .join("");
                modal.classList.add("show");
            });

            btnClose?.addEventListener("click", () =>
                modal.classList.remove("show")
            );

            // Submit Handler Buat Undangan Baru
            document
                .getElementById("form-create-invitation")
                ?.addEventListener("submit", async e => {
                    e.preventDefault();
                    const btnSave = document.getElementById(
                        "btn-save-invitation"
                    );
                    btnSave.disabled = true;
                    btnSave.innerText = "Menyimpan Undangan...";

                    try {
                        const themeId = selectTheme.value;
                        const title = document
                            .getElementById("inv-title")
                            .value.trim();
                        const slug = document
                            .getElementById("inv-slug")
                            .value.trim()
                            .toLowerCase()
                            .replace(/\s+/g, "-");
                        const eventDate =
                            document.getElementById("inv-date").value;

                        // 1. Insert Data Utama Undangan
                        const { data: newInv, error: invErr } = await supabase
                            .from("invitations")
                            .insert([
                                {
                                    user_id: currentUser.id,
                                    theme_id: themeId,
                                    slug: slug,
                                    title: title,
                                    meta_title: title,
                                    meta_description: `Undangan Pernikahan Online - ${title}`,
                                    event_date: new Date(
                                        eventDate
                                    ).toISOString(),
                                    is_active: true
                                }
                            ])
                            .select()
                            .single();

                        if (invErr)
                            throw new Error(
                                "Gagal membuat undangan (Slug mungkin sudah digunakan): " +
                                    invErr.message
                            );

                        // 2. Insert Data Mempelai Pria & Wanita
                        await supabase.from("invitation_couples").insert([
                            {
                                invitation_id: newInv.id,
                                gender: "groom",
                                full_name: document
                                    .getElementById("groom-full-name")
                                    .value.trim(),
                                short_name: document
                                    .getElementById("groom-short-name")
                                    .value.trim(),
                                father_name: document
                                    .getElementById("groom-father")
                                    .value.trim(),
                                mother_name: document
                                    .getElementById("groom-mother")
                                    .value.trim()
                            },
                            {
                                invitation_id: newInv.id,
                                gender: "bride",
                                full_name: document
                                    .getElementById("bride-full-name")
                                    .value.trim(),
                                short_name: document
                                    .getElementById("bride-short-name")
                                    .value.trim(),
                                father_name: document
                                    .getElementById("bride-father")
                                    .value.trim(),
                                mother_name: document
                                    .getElementById("bride-mother")
                                    .value.trim()
                            }
                        ]);

                        // 3. Insert Detail Acara
                        await supabase.from("invitation_events").insert([
                            {
                                invitation_id: newInv.id,
                                event_title: document
                                    .getElementById("event-title")
                                    .value.trim(),
                                event_date: eventDate,
                                start_time: document
                                    .getElementById("event-time")
                                    .value.trim(),
                                venue_name: document
                                    .getElementById("event-venue")
                                    .value.trim(),
                                address: document
                                    .getElementById("event-address")
                                    .value.trim()
                            }
                        ]);

                        showToast("Undangan berhasil dibuat!", "success");
                        modal.classList.remove("show");
                        e.target.reset();

                        await loadClientInvitations();
                        await loadOverviewData();
                    } catch (err) {
                        showToast(err.message, "error");
                    } finally {
                        btnSave.disabled = false;
                        btnSave.innerText = "Buat & Simpan Undangan";
                    }
                });
        }
    });
}
