
import { supabase } from "./supabase.js";

const container = document.querySelector("#plansContainer");
const message = document.querySelector("#plansMessage");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

async function loadPlans() {
  container.replaceChildren();

  const loading = document.createElement("p");
  loading.textContent = "Memuat paket...";
  container.append(loading);

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;

  if (!authData.user) {
    window.location.href = "/login/";
    return;
  }

  const { data: plans, error } = await supabase
    .from("plans")
    .select("id, code, name, description, price, duration_days, invitation_limit, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;

  container.replaceChildren();

  if (!plans?.length) {
    const empty = document.createElement("p");
    empty.textContent =
      "Belum ada paket tersedia. Silakan hubungi admin.";
    container.append(empty);
    return;
  }

  plans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "client-plan-card";

    const title = document.createElement("h3");
    title.textContent = plan.name;

    const price = document.createElement("p");
    price.className = "client-plan-price";
    price.textContent = formatRupiah(plan.price);

    const duration = document.createElement("p");
    duration.textContent =
      `Masa berlaku ${plan.duration_days} hari`;

    const limit = document.createElement("p");
    limit.textContent =
      `Maksimal ${plan.invitation_limit} undangan`;

    const description = document.createElement("p");
    description.textContent = plan.description || "";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Pilih Paket";

    button.addEventListener("click", () => {
      const params = new URLSearchParams({
        plan: plan.id
      });

      window.location.href = `/checkout/?${params.toString()}`;
    });

    card.append(title, price, duration, limit, description, button);
    container.append(card);
  });
}

loadPlans().catch((error) => {
  console.error("Gagal memuat paket:", error);
  showMessage(
    "Paket gagal dimuat. Periksa koneksi Supabase dan kebijakan akses tabel plans."
  );

  container.replaceChildren();
});
