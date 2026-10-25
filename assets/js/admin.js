
import { supabase } from "./supabase.js";
import { requireRole, setupLogout } from "./auth-guard.js";

setupLogout();

const $ = (id) => document.getElementById(id);
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
    .select(`
      id,
      code,
      name,
      description,
      price,
      duration_days,
      invitation_limit,
      is_active,
      display_order
    `)
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !currentAdmin) return;

  hideMessage();

  const id = $("planId").value;
  const price = Number($("planPrice").value);
  const limit = Number($("invitationLimit").value);
  const duration = Number($("durationDays").value);
  const order = Number($("displayOrder").value);

  if (
    !Number.isSafeInteger(price) || price < 0 ||
    !Number.isSafeInteger(limit) || limit < 1 ||
    duration !== 365 ||
    !Number.isSafeInteger(order) || order < 0
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
      id ? "Perubahan paket berhasil disimpan." : "Paket baru berhasil ditambahkan.",
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
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Dashboard admin gagal dimuat.", "error");
  }
}

init();
