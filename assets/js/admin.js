import { supabase } from "./supabase.js";
import { requireRole, setupLogout } from "./auth-guard.js";

setupLogout();

const $ = id => document.getElementById(id);
const form = $("planForm");
const tableBody = $("plansTableBody");
const saveButton = $("savePlanButton");
const message = $("adminMessage");

let currentAdmin = null;
let busy = false;

function showMessage(text, type = "") {
    message.textContent = text;
    message.className = "admin-message";
    if (type) message.classList.add(type);
    message.hidden = false;
}

function hideMessage() {
    message.hidden = true;
    message.textContent = "";
}

function rupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

function setBusy(value) {
    busy = value;
    saveButton.disabled = value;
    saveButton.textContent = value ? "Menyimpan..." : "Simpan Paket";
}

function resetForm() {
    form.reset();
    $("planId").value = "";
    $("durationDays").value = "365";
    $("displayOrder").value = "1";
    $("planActive").checked = true;
    saveButton.textContent = "Simpan Paket";
    hideMessage();
}

function fieldText(parent, text, tag = "td") {
    const element = document.createElement(tag);
    element.textContent = text ?? "-";
    parent.appendChild(element);
    return element;
}

async function loadPlans() {
    tableBody.replaceChildren();

    const { data, error } = await supabase
        .from("plans")
        .select(
            `
      id,
      code,
      name,
      description,
      price,
      duration_days,
      invitation_limit,
      is_active,
      display_order
    `
        )
        .order("display_order", { ascending: true });

    if (error) {
        throw new Error("Gagal mengambil paket. Periksa kebijakan RLS admin.");
    }

    if (!data?.length) {
        const row = document.createElement("tr");
        fieldText(row, "Belum ada paket.", "td").colSpan = 6;
        tableBody.appendChild(row);
        return;
    }

    for (const plan of data) {
        const row = document.createElement("tr");

        const planCell = document.createElement("td");
        const name = document.createElement("strong");
        name.textContent = plan.name;
        const code = document.createElement("div");
        code.textContent = plan.code;
        planCell.append(name, code);
        row.appendChild(planCell);

        fieldText(row, rupiah(plan.price));
        fieldText(row, String(plan.invitation_limit));
        fieldText(row, `${plan.duration_days} hari`);

        const statusCell = document.createElement("td");
        const status = document.createElement("span");
        status.className = "admin-status";
        status.textContent = plan.is_active ? "Aktif" : "Nonaktif";

        if (!plan.is_active) {
            status.classList.add("inactive");
        }

        statusCell.appendChild(status);
        row.appendChild(statusCell);

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editPlan(plan));

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.textContent = plan.is_active ? "Nonaktifkan" : "Aktifkan";
        toggleButton.addEventListener("click", () => togglePlan(plan));

        actions.append(editButton, toggleButton);
        row.appendChild(actions);
        tableBody.appendChild(row);
    }
}

function editPlan(plan) {
    $("planId").value = plan.id;
    $("planCode").value = plan.code;
    $("planName").value = plan.name;
    $("planPrice").value = plan.price;
    $("invitationLimit").value = plan.invitation_limit;
    $("durationDays").value = plan.duration_days;
    $("displayOrder").value = plan.display_order ?? 1;
    $("planDescription").value = plan.description || "";
    $("planActive").checked = Boolean(plan.is_active);

    saveButton.textContent = "Simpan Perubahan";
    hideMessage();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function togglePlan(plan) {
    if (busy) return;

    const action = plan.is_active ? "menonaktifkan" : "mengaktifkan";
    const confirmed = window.confirm(
        `Yakin ingin ${action} paket ${plan.name}?`
    );

    if (!confirmed) return;

    busy = true;

    try {
        const { error } = await supabase
            .from("plans")
            .update({ is_active: !plan.is_active })
            .eq("id", plan.id);

        if (error) throw error;

        showMessage("Status paket berhasil diperbarui.", "success");
        await loadPlans();
    } catch (error) {
        console.error(error);
        showMessage(
            "Status paket gagal diperbarui. Pastikan akun memiliki izin admin.",
            "error"
        );
    } finally {
        busy = false;
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !currentAdmin) return;

    hideMessage();

    const id = $("planId").value;
    const price = Number($("planPrice").value);
    const limit = Number($("invitationLimit").value);
    const duration = Number($("durationDays").value);
    const order = Number($("displayOrder").value);

    if (
        !Number.isSafeInteger(price) ||
        price < 0 ||
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        duration !== 365 ||
        !Number.isSafeInteger(order) ||
        order < 0
    ) {
        showMessage(
            "Periksa harga, batas undangan, durasi 365 hari, dan urutan tampil.",
            "error"
        );
        return;
    }

    const payload = {
        code: $("planCode").value,
        name: $("planName").value.trim(),
        description: $("planDescription").value.trim() || null,
        price,
        duration_days: 365,
        invitation_limit: limit,
        is_active: $("planActive").checked,
        display_order: order
    };

    if (!payload.name) {
        showMessage("Nama paket wajib diisi.", "error");
        return;
    }

    setBusy(true);

    try {
        let result;

        if (id) {
            result = await supabase
                .from("plans")
                .update(payload)
                .eq("id", id)
                .select("id")
                .single();
        } else {
            result = await supabase
                .from("plans")
                .insert(payload)
                .select("id")
                .single();
        }

        if (result.error) throw result.error;

        resetForm();
        showMessage(
            id
                ? "Perubahan paket berhasil disimpan."
                : "Paket baru berhasil ditambahkan.",
            "success"
        );
        await loadPlans();
    } catch (error) {
        console.error(error);
        showMessage(
            "Paket gagal disimpan. Periksa RLS, kode paket duplikat, dan struktur tabel plans.",
            "error"
        );
    } finally {
        setBusy(false);
    }
});

$("cancelEditButton").addEventListener("click", resetForm);

async function init() {
    try {
        const result = await requireRole(["admin"]);
        if (!result) return;

        currentAdmin = result.user;

$("welcomeMessage").textContent =
  `Selamat datang, ${result.profile.full_name || result.user.email || "Admin"}!`;

await loadPlans();
await initAdminThemes();
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Dashboard admin gagal dimuat.", "error");
    }
}

init();

/* =========================================
   MANAJEMEN KATALOG TEMA
========================================= */

const themeForm = document.getElementById("themeForm");
const themeTableBody = document.getElementById("themesTableBody");
const themeSaveButton = document.getElementById("saveThemeButton");
const themePlanOptions = document.getElementById("themePlanOptions");

let themeBusy = false;
let cachedPlans = [];

function themeMessage(text, type = "") {
    showMessage(text, type);
}

function safeExternalUrl(value) {
    if (!value) return null;

    try {
        const url = new URL(value);

        if (url.protocol !== "https:" && url.protocol !== "http:") {
            return null;
        }

        return url.href;
    } catch {
        return null;
    }
}

function selectedPlanIds() {
    return Array.from(
        themePlanOptions.querySelectorAll('input[name="themePlan"]:checked')
    ).map(input => input.value);
}

function renderPlanCheckboxes(selectedIds = []) {
    themePlanOptions.replaceChildren();

    if (!cachedPlans.length) {
        themePlanOptions.textContent =
            "Belum ada paket. Buat paket terlebih dahulu.";
        return;
    }

    for (const plan of cachedPlans) {
        const label = document.createElement("label");
        label.className = "admin-plan-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "themePlan";
        checkbox.value = plan.id;
        checkbox.checked = selectedIds.includes(plan.id);

        const text = document.createElement("span");
        text.textContent = `${plan.name}${plan.is_active ? "" : " (nonaktif)"}`;

        label.append(checkbox, text);
        themePlanOptions.appendChild(label);
    }
}

async function loadThemePlans() {
    const { data, error } = await supabase
        .from("plans")
        .select("id, code, name, is_active")
        .order("display_order", { ascending: true });

    if (error) {
        throw new Error("Gagal mengambil daftar paket untuk tema.");
    }

    cachedPlans = data || [];
    renderPlanCheckboxes();
}

async function getThemePlanMap() {
    const { data, error } = await supabase
        .from("plan_themes")
        .select("plan_id, theme_id");

    if (error) {
        throw new Error("Gagal mengambil hubungan tema dengan paket.");
    }

    const map = new Map();

    for (const item of data || []) {
        if (!map.has(item.theme_id)) {
            map.set(item.theme_id, []);
        }

        map.get(item.theme_id).push(item.plan_id);
    }

    return map;
}

async function loadThemes() {
    const [{ data: themes, error }, planMap] = await Promise.all([
        supabase
            .from("themes")
            .select(
                `
        id,
        slug,
        name,
        category,
        preview_image,
        demo_url,
        description,
        is_active,
        display_order
      `
            )
            .order("display_order", { ascending: true }),

        getThemePlanMap()
    ]);

    if (error) {
        throw new Error("Gagal mengambil katalog tema dari Supabase.");
    }

    themeTableBody.replaceChildren();

    if (!themes?.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "Belum ada tema. Tambahkan tema melalui formulir.";
        row.appendChild(cell);
        themeTableBody.appendChild(row);
        return;
    }

    for (const theme of themes) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");

        if (theme.preview_image) {
            const previewUrl = safeExternalUrl(theme.preview_image);

            if (previewUrl) {
                const image = document.createElement("img");
                image.className = "admin-theme-preview";
                image.src = previewUrl;
                image.alt = `Preview ${theme.name}`;
                image.loading = "lazy";
                image.referrerPolicy = "no-referrer";
                nameCell.appendChild(image);
            }
        }

        const name = document.createElement("strong");
        name.textContent = theme.name;

        const slug = document.createElement("div");
        slug.textContent = theme.slug;

        nameCell.append(name, slug);
        row.appendChild(nameCell);

        fieldText(
            row,
            theme.category === "wedding" ? "Pernikahan" : "Acara Lain"
        );

        const packageCell = document.createElement("td");
        const packageNames = (planMap.get(theme.id) || [])
            .map(id => cachedPlans.find(plan => plan.id === id)?.name)
            .filter(Boolean);

        packageCell.textContent = packageNames.length
            ? packageNames.join(", ")
            : "Belum dihubungkan";

        row.appendChild(packageCell);

        const statusCell = document.createElement("td");
        const status = document.createElement("span");

        status.className = "admin-status";
        status.textContent = theme.is_active ? "Aktif" : "Nonaktif";

        if (!theme.is_active) {
            status.classList.add("inactive");
        }

        statusCell.appendChild(status);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editTheme(theme, planMap));

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.textContent = theme.is_active ? "Nonaktifkan" : "Aktifkan";
        toggleButton.addEventListener("click", () => toggleTheme(theme));

        actionCell.append(editButton, toggleButton);
        row.appendChild(actionCell);

        themeTableBody.appendChild(row);
    }
}

function editTheme(theme, planMap) {
    $("themeId").value = theme.id;
    $("themeName").value = theme.name || "";
    $("themeSlug").value = theme.slug || "";
    $("themeCategory").value = theme.category || "wedding";
    $("themeOrder").value = theme.display_order ?? 1;
    $("themePreview").value = theme.preview_image || "";
    $("themeDemo").value = theme.demo_url || "";
    $("themeDescription").value = theme.description || "";
    $("themeActive").checked = Boolean(theme.is_active);

    renderPlanCheckboxes(planMap.get(theme.id) || []);
    themeSaveButton.textContent = "Simpan Perubahan";
    hideMessage();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetThemeForm() {
    themeForm.reset();

    $("themeId").value = "";
    $("themeOrder").value = "1";
    $("themeActive").checked = true;

    renderPlanCheckboxes();
    themeSaveButton.textContent = "Simpan Tema";
    hideMessage();
}

async function saveThemePlanLinks(themeId, planIds) {
    // Hapus hubungan lama, lalu masukkan pilihan terbaru.
    const { error: deleteError } = await supabase
        .from("plan_themes")
        .delete()
        .eq("theme_id", themeId);

    if (deleteError) {
        throw new Error("Gagal menghapus hubungan paket tema yang lama.");
    }

    if (planIds.length === 0) return;

    const rows = planIds.map(planId => ({
        plan_id: planId,
        theme_id: themeId
    }));

    const { error: insertError } = await supabase
        .from("plan_themes")
        .insert(rows);

    if (insertError) {
        throw new Error(
            "Tema tersimpan, tetapi hubungan paket gagal diperbarui. Periksa RLS tabel plan_themes."
        );
    }
}

themeForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (themeBusy || !currentAdmin) return;

    hideMessage();

    const id = $("themeId").value;
    const slug = $("themeSlug").value.trim();
    const name = $("themeName").value.trim();
    const order = Number($("themeOrder").value);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        themeMessage(
            "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
            "error"
        );
        return;
    }

    if (!name || !Number.isSafeInteger(order) || order < 0) {
        themeMessage("Periksa nama tema dan urutan tampil.", "error");
        return;
    }

    const previewInput = $("themePreview").value.trim();
    const demoInput = $("themeDemo").value.trim();

    if (previewInput && !safeExternalUrl(previewInput)) {
        themeMessage("URL gambar preview tidak valid.", "error");
        return;
    }

    if (demoInput && !safeExternalUrl(demoInput)) {
        themeMessage("URL demo tidak valid.", "error");
        return;
    }

    const payload = {
        slug,
        name,
        category: $("themeCategory").value,
        preview_image: previewInput || null,
        demo_url: demoInput || null,
        description: $("themeDescription").value.trim() || null,
        is_active: $("themeActive").checked,
        display_order: order
    };

    const planIds = selectedPlanIds();

    themeBusy = true;
    themeSaveButton.disabled = true;
    themeSaveButton.textContent = "Menyimpan...";

    try {
        let themeId = id;

        if (id) {
            const { error } = await supabase
                .from("themes")
                .update(payload)
                .eq("id", id);

            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from("themes")
                .insert(payload)
                .select("id")
                .single();

            if (error) throw error;
            themeId = data.id;
        }

        await saveThemePlanLinks(themeId, planIds);

        resetThemeForm();
        themeMessage("Tema dan pengaturan paket berhasil disimpan.", "success");
        await loadThemes();
    } catch (error) {
        console.error(error);

        themeMessage(
            error.message ||
                "Tema gagal disimpan. Periksa slug duplikat dan kebijakan RLS.",
            "error"
        );

        // Jika tema baru sudah tersimpan tetapi relasi gagal,
        // muat ulang agar tema tetap terlihat di daftar.
        try {
            await loadThemes();
        } catch (reloadError) {
            console.error(reloadError);
        }
    } finally {
        themeBusy = false;
        themeSaveButton.disabled = false;
        themeSaveButton.textContent = $("themeId").value
            ? "Simpan Perubahan"
            : "Simpan Tema";
    }
});

async function toggleTheme(theme) {
    if (themeBusy) return;

    const action = theme.is_active ? "menonaktifkan" : "mengaktifkan";

    if (!window.confirm(`Yakin ingin ${action} tema ${theme.name}?`)) {
        return;
    }

    themeBusy = true;

    try {
        const { error } = await supabase
            .from("themes")
            .update({ is_active: !theme.is_active })
            .eq("id", theme.id);

        if (error) throw error;

        themeMessage("Status tema berhasil diperbarui.", "success");
        await loadThemes();
    } catch (error) {
        console.error(error);
        themeMessage(
            "Status tema gagal diperbarui. Periksa izin admin dan RLS.",
            "error"
        );
    } finally {
        themeBusy = false;
    }
}

$("cancelThemeButton").addEventListener("click", resetThemeForm);

// Jalankan setelah role admin berhasil diverifikasi.
const originalAdminInit = init;

async function initAdminThemes() {
    try {
        if (!currentAdmin) return;

        await loadThemePlans();
        await loadThemes();
    } catch (error) {
        console.error(error);
        themeMessage(error.message || "Katalog tema gagal dimuat.", "error");
    }
}
