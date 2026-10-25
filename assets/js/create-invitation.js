
import { supabase } from "./supabase.js";

const form = document.querySelector("#createInvitationForm");

if (form) {
  const message = document.querySelector("#createInvitationMessage");
  const themeSelect = document.querySelector("#invitationTheme");
  const saveButton = document.querySelector("#saveInvitationButton");

  let currentUser = null;
  let activeSubscription = null;
  let availableThemes = [];

  function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `form-message ${type}`;
  }

  function setLoading(isLoading) {
    saveButton.disabled = isLoading;
    saveButton.textContent = isLoading
      ? "Menyimpan..."
      : "Simpan sebagai Draft";
  }

  function slugify(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function loadActiveSubscription() {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        plan_id,
        status,
        expires_at,
        plans (
          id,
          name,
          invitation_limit,
          is_active
        )
      `)
      .eq("user_id", currentUser.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    activeSubscription = data?.find(
      (item) => item.plans?.is_active === true
    ) ?? null;

    if (!activeSubscription) {
      throw new Error(
        "Anda belum memiliki paket aktif. Silakan berlangganan terlebih dahulu."
      );
    }
  }

  async function loadAvailableThemes() {
    const { data, error } = await supabase
      .from("plan_themes")
      .select(`
        theme:themes (
          id,
          name,
          slug,
          category,
          is_active
        )
      `)
      .eq("plan_id", activeSubscription.plan_id);

    if (error) throw error;

    availableThemes = (data ?? [])
      .map((item) => item.theme)
      .filter((theme) =>
        theme?.is_active &&
        theme.category ===
          document.querySelector("#invitationEventType").value
      );

    themeSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = availableThemes.length
      ? "Pilih tema"
      : "Belum ada tema untuk kategori ini";
    themeSelect.append(placeholder);

    availableThemes.forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme.id;
      option.textContent = theme.name;
      themeSelect.append(option);
    });
  }

  async function initializeForm() {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (!data.user) {
      window.location.href = "/login/";
      return;
    }

    currentUser = data.user;

    await loadActiveSubscription();
    await loadAvailableThemes();
  }

  document
    .querySelector("#invitationEventType")
    .addEventListener("change", async () => {
      if (!activeSubscription) return;

      try {
        await loadAvailableThemes();
      } catch (error) {
        showMessage(error.message);
      }
    });

  document
    .querySelector("#invitationTitle")
    .addEventListener("input", (event) => {
      const slugInput = document.querySelector("#invitationSlug");

      if (!slugInput.dataset.edited) {
        slugInput.value = slugify(event.target.value);
      }
    });

  document
    .querySelector("#invitationSlug")
    .addEventListener("input", (event) => {
      event.target.dataset.edited = "true";
      event.target.value = slugify(event.target.value);
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!currentUser || !activeSubscription) {
        throw new Error("Akun atau paket aktif tidak ditemukan.");
      }

      const formData = new FormData(form);
      const slug = slugify(formData.get("slug"));
      const themeId = formData.get("theme_id");
      const eventType = formData.get("event_type");

      const selectedTheme = availableThemes.find(
        (theme) => theme.id === themeId
      );

      if (!selectedTheme) {
        throw new Error(
          "Tema tidak valid untuk kategori acara atau paket Anda."
        );
      }

      if (!slug) {
        throw new Error("Slug undangan wajib diisi.");
      }

      const rawDate = formData.get("event_date");
      const eventDate = new Date(rawDate);

      if (!rawDate || Number.isNaN(eventDate.getTime())) {
        throw new Error("Tanggal acara tidak valid.");
      }

      const mapsUrl = String(formData.get("maps_url") || "").trim();

      if (mapsUrl) {
        const parsedUrl = new URL(mapsUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Link Google Maps harus menggunakan HTTP atau HTTPS.");
        }
      }

      const hostNames = String(formData.get("host_names"))
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

      if (!hostNames.length) {
        throw new Error("Nama pasangan atau penyelenggara wajib diisi.");
      }

      const payload = {
        user_id: currentUser.id,
        subscription_id: activeSubscription.id,
        theme_id: selectedTheme.id,
        slug,
        title: String(formData.get("title")).trim(),
        event_type: eventType,
        event_date: eventDate.toISOString(),
        venue_name: String(formData.get("venue_name") || "").trim() || null,
        venue_address:
          String(formData.get("venue_address") || "").trim() || null,
        maps_url: mapsUrl || null,
        host_names: hostNames,
        content: {},
        status: "draft"
      };

      const { data, error } = await supabase
        .from("invitations")
        .insert(payload)
        .select("id, slug, title, status")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Slug ini sudah digunakan. Silakan gunakan slug lain.");
        }

        throw error;
      }

      showMessage(
        `Undangan "${data.title}" berhasil disimpan sebagai draft.`,
        "success"
      );

      form.reset();
      document.querySelector("#invitationSlug").dataset.edited = "";
      await loadAvailableThemes();

      // Jika daftar undangan lama ada di halaman,
      // panggil fungsi pemuat ulang daftar di sini.
      document.dispatchEvent(
        new CustomEvent("invitation:created", { detail: data })
      );
    } catch (error) {
      console.error("Gagal membuat undangan:", error);
      showMessage(error.message || "Gagal menyimpan undangan.");
    } finally {
      setLoading(false);
    }
  });

  initializeForm().catch((error) => {
    console.error("Gagal memuat form:", error);
    showMessage(error.message || "Gagal memuat data paket dan tema.");
    themeSelect.replaceChildren();

    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Tema belum dapat dimuat";
    themeSelect.append(option);
  });
}
