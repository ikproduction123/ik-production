
import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const planId = params.get("plan");

const message = document.querySelector("#checkoutMessage");
const summary = document.querySelector("#planSummary");
const createButton = document.querySelector("#createOrderButton");
const paymentSection = document.querySelector("#paymentSection");
const proofForm = document.querySelector("#proofForm");

let currentUser;
let selectedPlan;
let currentOrder;

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `checkout-message ${type}`;
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

async function initialize() {
  if (!planId) {
    throw new Error("Paket belum dipilih. Silakan kembali ke dashboard.");
  }

  const { data: auth, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;

  if (!auth.user) {
    window.location.href = "/login/";
    return;
  }

  currentUser = auth.user;

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, description, price, duration_days, invitation_limit")
    .eq("id", planId)
    .eq("is_active", true)
    .single();

  if (error) throw error;

  selectedPlan = data;

  const title = document.createElement("h2");
  title.textContent = selectedPlan.name;

  const price = document.createElement("p");
  price.textContent = formatRupiah(selectedPlan.price);

  const duration = document.createElement("p");
  duration.textContent = `Masa berlaku ${selectedPlan.duration_days} hari`;

  const limit = document.createElement("p");
  limit.textContent =
    `Maksimal ${selectedPlan.invitation_limit} undangan`;

  const description = document.createElement("p");
  description.textContent = selectedPlan.description || "";

  summary.replaceChildren(title, price, duration, limit, description);
  createButton.disabled = false;
}

createButton.addEventListener("click", async () => {
  createButton.disabled = true;
  createButton.textContent = "Membuat pesanan...";

  try {
    const { data, error } = await supabase.rpc(
      "create_checkout_order",
      { p_plan_id: selectedPlan.id }
    );

    if (error) throw error;

    currentOrder = data;

    document.querySelector("#paymentAmount").textContent =
      formatRupiah(data.amount);

    document.querySelector("#orderReference").textContent =
      `Nomor pesanan: ${data.payment_id}`;

    paymentSection.hidden = false;
    createButton.hidden = true;

    showMessage(
      "Pesanan berhasil dibuat. Silakan transfer sesuai instruksi.",
      "success"
    );
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Gagal membuat pesanan.");
    createButton.disabled = false;
    createButton.textContent = "Buat Pesanan";
  }
});

proofForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentOrder) {
    showMessage("Buat pesanan terlebih dahulu.");
    return;
  }

  const input = document.querySelector("#paymentProof");
  const file = input.files[0];
  const submitButton = document.querySelector("#submitProofButton");

  if (!file) {
    showMessage("Pilih file bukti transfer terlebih dahulu.");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (!allowedTypes.includes(file.type)) {
    showMessage("Format file harus JPG, PNG, WebP, atau PDF.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showMessage("Ukuran file maksimal 5 MB.");
    return;
  }

  const extensionByType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf"
  };

  // UUID dibuat di browser untuk menghindari nama file berbasis input pengguna.
  const fileId = crypto.randomUUID();
  const filePath =
    `${currentUser.id}/${fileId}.${extensionByType[file.type]}`;

  submitButton.disabled = true;
  submitButton.textContent = "Mengunggah bukti...";

  try {
    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { error: proofError } = await supabase.rpc(
      "submit_payment_proof",
      {
        p_payment_id: currentOrder.payment_id,
        p_proof_path: filePath
      }
    );

    if (proofError) {
      // File tetap privat; admin dapat membersihkannya jika diperlukan.
      throw proofError;
    }

    showMessage(
      "Bukti pembayaran berhasil dikirim. Tunggu verifikasi admin.",
      "success"
    );

    proofForm.reset();
    submitButton.textContent = "Bukti Terkirim";
  } catch (error) {
    console.error(error);
    showMessage(
      error.message ||
      "Bukti gagal dikirim. Periksa koneksi dan kebijakan Storage."
    );
    submitButton.disabled = false;
    submitButton.textContent = "Kirim Bukti Pembayaran";
  }
});

initialize().catch((error) => {
  console.error(error);
  showMessage(error.message || "Gagal memuat halaman checkout.");
  createButton.disabled = true;
});
