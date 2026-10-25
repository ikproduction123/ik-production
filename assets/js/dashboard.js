
import { supabase } from "./supabase.js";
import { requireRole, setupLogout } from "./auth-guard.js";

setupLogout();

const message = document.getElementById("dashboardMessage");
const content = document.getElementById("dashboardContent");

const $ = (id) => document.getElementById(id);

function showMessage(text, isError = false) {
  message.hidden = false;
  message.textContent = text;
  message.classList.toggle("dashboard-error", isError);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function setStatus(element, status, label) {
  element.textContent = label;
  element.className = "status";

  const classes = {
    active: "status-active",
    pending: "status-pending",
    expired: "status-expired",
    cancelled: "status-cancelled",
    rejected: "status-rejected"
  };

  if (classes[status]) {
    element.classList.add(classes[status]);
  }
}

function getSubscriptionLabel(subscription) {
  if (!subscription) return "Belum berlangganan";

  const isExpired =
    subscription.expires_at &&
    new Date(subscription.expires_at).getTime() <= Date.now();

  if (isExpired && subscription.status === "active") {
    return "Kedaluwarsa";
  }

  const labels = {
    active: "Aktif",
    pending: "Menunggu pembayaran/aktivasi",
    expired: "Kedaluwarsa",
    cancelled: "Dibatalkan"
  };

  return labels[subscription.status] || subscription.status;
}

async function loadDashboard(user, profile) {
  // Tampilkan profil akun.
  $("welcomeMessage").textContent =
    `Selamat datang, ${profile.full_name || user.email || "Pelanggan"}!`;

  $("profileName").textContent = profile.full_name || "-";
  $("profileEmail").textContent = user.email || "-";
  $("profilePhone").textContent = profile.phone || "Belum diisi";

  // Ambil riwayat langganan terbaru beserta data paket.
  const { data: subscriptions, error: subscriptionError } =
    await supabase
      .from("subscriptions")
      .select(`
        id,
        status,
        started_at,
        expires_at,
        created_at,
        plans (
          name,
          code,
          price,
          invitation_limit,
          duration_days
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

  if (subscriptionError) {
    throw new Error("Data paket belum dapat dimuat. Periksa kebijakan RLS dan relasi tabel.");
  }

  const subscriptionList = subscriptions || [];

  // Pilih langganan aktif yang belum melewati tanggal kedaluwarsa.
  const activeSubscription = subscriptionList.find((item) => {
    return (
      item.status === "active" &&
      item.expires_at &&
      new Date(item.expires_at).getTime() > Date.now()
    );
  });

  // Jika tidak ada langganan aktif, tampilkan langganan terbaru.
  const displayedSubscription =
    activeSubscription || subscriptionList[0] || null;

  const plan = displayedSubscription?.plans;

  $("planName").textContent = plan?.name || "Belum berlangganan";

  setStatus(
    $("subscriptionStatus"),
    displayedSubscription?.status || "",
    getSubscriptionLabel(displayedSubscription)
  );

  if (displayedSubscription && plan) {
    const start = formatDate(displayedSubscription.started_at);
    const expiry = formatDate(displayedSubscription.expires_at);

    $("subscriptionDetails").textContent =
      `Harga paket: ${formatRupiah(plan.price)}. ` +
      `Mulai: ${start}. Berakhir: ${expiry}.`;
  } else {
    $("subscriptionDetails").textContent =
      "Silakan pilih paket dan selesaikan proses pembayaran untuk mengaktifkan langganan.";
  }

  // Ambil daftar undangan milik pelanggan.
  const { data: invitations, error: invitationError } =
    await supabase
      .from("invitations")
      .select(`
        id,
        title,
        slug,
        status,
        event_date,
        created_at,
        themes (
          name,
          slug
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

  if (invitationError) {
    throw new Error("Daftar undangan belum dapat dimuat. Periksa kebijakan RLS dan relasi tabel.");
  }

  const invitationList = invitations || [];

  // Batas paket berlaku pada langganan yang dipilih dan aktif.
  if (activeSubscription && plan) {
    const used = invitationList.filter(
      (invitation) =>
        invitation.subscription_id === activeSubscription.id
    ).length;

    const limit = Number(plan.invitation_limit);

    $("invitationLimit").textContent =
      `${used} dari ${limit} undangan digunakan`;
  } else if (plan) {
    $("invitationLimit").textContent =
      `${plan.invitation_limit} undangan per paket`;
  } else {
    $("invitationLimit").textContent = "Belum memiliki paket";
  }

  $("invitationCount").textContent =
    `Total undangan Anda: ${invitationList.length}`;

  renderInvitations(invitationList);

  message.hidden = true;
  content.hidden = false;
}

function renderInvitations(invitations) {
  const list = $("invitationList");
  list.replaceChildren();

  if (invitations.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dashboard-message";
    empty.textContent =
      "Anda belum memiliki undangan. Silakan lihat katalog tema untuk menentukan desain yang diinginkan.";

    list.appendChild(empty);
    return;
  }

  const statusLabels = {
    draft: "Draft",
    published: "Dipublikasikan",
    archived: "Diarsipkan"
  };

  for (const invitation of invitations) {
    const card = document.createElement("article");
    card.className = "invitation-item";

    const title = document.createElement("h3");
    title.textContent = invitation.title || "Undangan tanpa judul";

    const theme = document.createElement("p");
    theme.textContent =
      `Tema: ${invitation.themes?.name || "Belum ditentukan"}`;

    const date = document.createElement("p");
    date.textContent = `Tanggal acara: ${formatDate(invitation.event_date)}`;

    const status = document.createElement("span");
    status.className = "status";
    status.textContent =
      statusLabels[invitation.status] || invitation.status;

    card.append(title, theme, date, status);

    if (invitation.status === "published" && invitation.slug) {
      const link = document.createElement("a");
      link.className = "invitation-link";
      link.href =
        `/${encodeURIComponent(invitation.slug)}/?to=Tamu+Undangan`;
      link.textContent = "Lihat tautan undangan";
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      card.appendChild(document.createElement("br"));
      card.appendChild(link);
    }

    list.appendChild(card);
  }
}

async function init() {
  try {
    const result = await requireRole(["customer"]);

    if (!result) return;

    await loadDashboard(result.user, result.profile);
  } catch (error) {
    console.error("Dashboard error:", error);
    showMessage(
      error.message || "Terjadi kesalahan saat memuat dashboard.",
      true
    );
  }
}

init();
