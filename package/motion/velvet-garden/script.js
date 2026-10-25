
import { supabase } from "/assets/js/supabase.js";

const slug = location.pathname.split("/").filter(Boolean)[0];
const guest = new URLSearchParams(location.search).get("to");

async function loadWedding() {
  const { data, error } = await supabase
    .from("invitations")
    .select(`
      title,
      host_names,
      event_date,
      venue_name,
      venue_address,
      maps_url
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    document.body.textContent = "Undangan tidak ditemukan.";
    return;
  }

  const names = Array.isArray(data.host_names)
    ? data.host_names.join(" & ")
    : "";

  const title = document.getElementById("coupleNames");
  if (title) title.textContent = names || data.title || "Undangan";

  const guestElement = document.getElementById("guestName");
  if (guestElement) {
    guestElement.textContent = guest
      ? `Kepada Yth. ${guest}`
      : "";
  }

  const dateElement = document.getElementById("eventDate");
  if (dateElement && data.event_date) {
    dateElement.textContent = new Date(data.event_date)
      .toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta"
      }) + " WIB";
  }

  const venue = document.getElementById("venueName");
  if (venue) venue.textContent = data.venue_name || "";

  const address = document.getElementById("venueAddress");
  if (address) address.textContent = data.venue_address || "";

  const maps = document.getElementById("mapsLink");

  if (maps && data.maps_url) {
    try {
      const url = new URL(data.maps_url);

      if (
        url.protocol === "https:" &&
        ["maps.google.com", "www.google.com", "google.com", "maps.app.goo.gl"]
          .includes(url.hostname)
      ) {
        maps.href = url.href;
        maps.hidden = false;
      }
    } catch {
      // Abaikan link lokasi yang tidak valid.
    }
  }

  const openButton = document.getElementById("openInvitation");
  const content = document.getElementById("invitationContent");

  if (openButton && content) {
    openButton.addEventListener("click", () => {
      content.hidden = false;
      content.scrollIntoView({ behavior: "smooth" });
    });
  }
}

loadWedding();
