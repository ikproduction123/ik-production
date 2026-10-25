
import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);

function showError() {
  $("loadingMessage").hidden = true;
  $("errorMessage").hidden = false;
}

function formatEventDate(value) {
  if (!value) return "Tanggal acara belum ditentukan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date) + " WIB";
}

function safeMapsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" &&
        (url.hostname === "maps.google.com" ||
         url.hostname === "www.google.com" ||
         url.hostname === "google.com" ||
         url.hostname === "maps.app.goo.gl")) {
      return url.href;
    }
  } catch {
    // URL tidak valid.
  }

  return null;
}

async function loadInvitation() {
  const slug = window.location.pathname
    .split("/")
    .filter(Boolean)[0];

  if (!slug || [
    "login", "register", "forgot-password",
    "reset-password", "dashboard", "admin",
    "checkout", "invitation"
  ].includes(slug)) {
    showError();
    return;
  }

  const guest = new URLSearchParams(window.location.search)
    .get("to");

  try {
    const { data, error } = await supabase
      .from("invitations")
      .select(`
        slug,
        title,
        event_type,
        event_date,
        venue_name,
        venue_address,
        maps_url,
        host_names,
        content,
        status,
        theme:themes (
          name,
          slug
        )
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      showError();
      return;
    }

    // Gunakan textContent agar data dari database
    // tidak diperlakukan sebagai HTML.
    $("eventTitle").textContent = data.title || "Undangan";
    $("eventDate").textContent = formatEventDate(data.event_date);

    const hosts = Array.isArray(data.host_names)
      ? data.host_names.filter(
          (name) => typeof name === "string" && name.trim()
        )
      : [];

    $("hostNames").textContent = hosts.join(" & ");
    $("venueName").textContent =
      data.venue_name || "Informasi tempat menyusul";
    $("venueAddress").textContent = data.venue_address || "";

    $("eventDescription").textContent =
      data.event_type === "wedding"
        ? "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir."
        : "Dengan hormat, kami mengundang Anda untuk menghadiri acara kami.";

    if (guest?.trim()) {
      $("guestGreeting").textContent =
        `Kepada Yth. ${guest.trim()}`;
      $("guestName").textContent =
        `Undangan ini ditujukan kepada ${guest.trim()}.`;
    } else {
      $("guestGreeting").textContent =
        "Dengan hormat, kami mengundang Anda.";
      $("guestName").textContent = "";
    }

    const mapsUrl = safeMapsUrl(data.maps_url);

    if (mapsUrl) {
      $("mapsLink").href = mapsUrl;
      $("mapsLink").hidden = false;
    }

    document.title = `${data.title || "Undangan"} | IK Production`;
    $("loadingMessage").hidden = true;
    $("eventDetails").hidden = false;
    $("openInvitation").hidden = false;

    $("openInvitation").addEventListener("click", () => {
      $("eventDetails").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, { once: true });

  } catch (error) {
    console.error("Gagal memuat undangan:", error);
    showError();
  }
}

loadInvitation();
