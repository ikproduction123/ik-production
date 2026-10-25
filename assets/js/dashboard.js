import { supabase } from "./supabase.js";
import { requireRole, setupLogout } from "./auth-guard.js";

setupLogout();

const $ = id => document.getElementById(id);
const message = $("dashboardMessage");
const content = $("dashboardContent");

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
    if (!element) return;

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
    if (!subscription) return "Belum ada paket";

    const expired =
        subscription.expires_at &&
        new Date(subscription.expires_at).getTime() <= Date.now();

    if (expired && subscription.status === "active") {
        return "Kedaluwarsa";
    }

    const labels = {
        active: "Aktif",
        pending: "Menunggu pembayaran/aktivasi",
        expired: "Kedaluwarsa",
        cancelled: "Dibatalkan"
    };

    return labels[subscription.status] || subscription.status || "-";
}

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
}

async function loadDashboard(user, profile) {
    setText(
        "welcomeMessage",
        `Halo, ${profile.full_name || user.email || "Pelanggan"}! Senang melihat Anda kembali.`
    );

    setText("profileName", profile.full_name || "-");
    setText("profileEmail", user.email || "-");
    setText("profilePhone", profile.phone || "Belum diisi");

    // Ambil data paket pelanggan.
    const { data: subscriptions, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select(
            `
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
      `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (subscriptionError) {
        throw new Error(
            "Data paket tidak dapat dimuat. Periksa relasi tabel dan kebijakan RLS Supabase."
        );
    }

    const subscriptionList = subscriptions || [];

    const activeSubscription = subscriptionList.find(
        item =>
            item.status === "active" &&
            item.expires_at &&
            new Date(item.expires_at).getTime() > Date.now()
    );

    const displayedSubscription =
        activeSubscription || subscriptionList[0] || null;

    const plan = displayedSubscription?.plans || null;

    setText("planName", plan?.name || "Belum berlangganan");

    setStatus(
        $("subscriptionStatus"),
        displayedSubscription?.status || "",
        getSubscriptionLabel(displayedSubscription)
    );

    if (displayedSubscription && plan) {
        const start = formatDate(displayedSubscription.started_at);
        const expiry = formatDate(displayedSubscription.expires_at);

        setText(
            "subscriptionDetails",
            `Harga ${formatRupiah(plan.price)} · Mulai ${start} · Berakhir ${expiry}`
        );
    } else {
        setText(
            "subscriptionDetails",
            "Pilih paket untuk mulai membuat dan menerbitkan undangan."
        );
    }

    // Ambil undangan. subscription_id diperlukan untuk perhitungan limit.
    const { data: invitations, error: invitationError } = await supabase
        .from("invitations")
        .select(
            `
        id,
        subscription_id,
        title,
        slug,
        status,
        event_date,
        created_at,
        updated_at,
        themes (
          name,
          slug
        )
      `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (invitationError) {
        throw new Error(
            "Daftar undangan tidak dapat dimuat. Periksa relasi tabel dan kebijakan RLS Supabase."
        );
    }

    const invitationList = invitations || [];

    const publishedCount = invitationList.filter(
        item => item.status === "published"
    ).length;

    const draftCount = invitationList.filter(
        item => item.status === "draft"
    ).length;

    setText("statInvitationCount", String(invitationList.length));
    setText("statPublishedCount", String(publishedCount));
    setText("statDraftCount", String(draftCount));

    const daysRemaining = activeSubscription
        ? Math.max(
              0,
              Math.ceil(
                  (new Date(activeSubscription.expires_at).getTime() -
                      Date.now()) /
                      86400000
              )
          )
        : null;

    setText(
        "statDaysRemaining",
        daysRemaining === null ? "-" : String(daysRemaining)
    );

    setText(
        "statExpiryLabel",
        activeSubscription
            ? `Berakhir ${formatDate(activeSubscription.expires_at)}`
            : "Tidak ada paket aktif"
    );

    if (activeSubscription && plan) {
        const used = invitationList.filter(
            item => item.subscription_id === activeSubscription.id
        ).length;

        const limit = Math.max(0, Number(plan.invitation_limit) || 0);
        const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

        setText(
            "invitationLimit",
            limit > 0
                ? `${used} dari ${limit} undangan`
                : `${used} undangan digunakan`
        );

        const progress = $("invitationProgress");
        if (progress) progress.style.width = `${percentage}%`;
    } else if (plan) {
        setText(
            "invitationLimit",
            `${Number(plan.invitation_limit) || 0} undangan per paket`
        );
        if ($("invitationProgress")) $("invitationProgress").style.width = "0%";
    } else {
        setText("invitationLimit", "Belum memiliki paket");
        if ($("invitationProgress")) $("invitationProgress").style.width = "0%";
    }

    setText(
        "invitationCount",
        `Total ${invitationList.length} undangan · ${publishedCount} dipublikasikan`
    );

    renderInvitations(invitationList);
    renderRecentActivity(invitationList);

    message.hidden = true;
    content.hidden = false;
}

function renderInvitations(invitations) {
    const list = $("invitationList");
    if (!list) return;

    list.replaceChildren();

    if (invitations.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-note";
        empty.textContent =
            "Anda belum memiliki undangan. Pilih tema dan buat undangan pertama Anda.";
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
        theme.textContent = `Tema: ${invitation.themes?.name || "Belum ditentukan"}`;

        const date = document.createElement("p");
        date.textContent = `Tanggal acara: ${formatDate(invitation.event_date)}`;

        const status = document.createElement("span");
        status.className = "status";
        status.textContent =
            statusLabels[invitation.status] || invitation.status || "-";

        if (invitation.status === "published") {
            status.classList.add("status-active");
        }

        card.append(title, theme, date, status);

        if (invitation.status === "published" && invitation.slug) {
            const link = document.createElement("a");
            link.className = "invitation-link";
            link.href = `/${encodeURIComponent(invitation.slug)}/?to=Tamu+Undangan`;
            link.textContent = "Buka undangan ↗";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            card.appendChild(link);
        }

        list.appendChild(card);
    }
}

function renderRecentActivity(invitations) {
    const list = $("recentActivityList");
    if (!list) return;

    list.replaceChildren();

    if (invitations.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-note";
        empty.textContent =
            "Aktivitas undangan akan muncul setelah Anda membuat undangan.";
        list.appendChild(empty);
        return;
    }

    const recent = [...invitations]
        .sort(
            (a, b) =>
                new Date(b.updated_at || b.created_at || 0) -
                new Date(a.updated_at || a.created_at || 0)
        )
        .slice(0, 5);

    const labels = {
        published: "Undangan telah dipublikasikan",
        draft: "Undangan masih dalam status draft",
        archived: "Undangan diarsipkan"
    };

    for (const invitation of recent) {
        const item = document.createElement("div");
        item.className = "activity-item";

        const mark = document.createElement("span");
        mark.className = "activity-mark";
        mark.textContent = invitation.status === "published" ? "✓" : "✦";

        const copy = document.createElement("div");
        copy.className = "activity-copy";

        const title = document.createElement("strong");
        title.textContent = invitation.title || "Undangan tanpa judul";

        const description = document.createElement("p");
        description.textContent =
            labels[invitation.status] || "Status undangan diperbarui";

        const time = document.createElement("time");
        const dateValue = invitation.updated_at || invitation.created_at;

        time.textContent = formatDate(dateValue);

        if (dateValue) {
            const timestamp = new Date(dateValue).getTime();
            if (!Number.isNaN(timestamp)) {
                time.dateTime = new Date(timestamp).toISOString();
            }
        }

        copy.append(title, description, time);
        item.append(mark, copy);
        list.appendChild(item);
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
