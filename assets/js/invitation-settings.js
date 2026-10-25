
import { supabase } from "./supabase.js";

const list = document.getElementById("invitationSettingsList");
const message = document.getElementById("invitationSettingsMessage");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#b42318" : "#217a45";
}

function createButton(text, action, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.disabled = disabled;
  button.addEventListener("click", action);
  return button;
}

async function loadInvitations() {
  list.replaceChildren();
  const loading = document.createElement("p");
  loading.textContent = "Memuat undangan...";
  list.append(loading);

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    showMessage("Silakan login kembali.", true);
    return;
  }

  const { data, error } = await supabase
    .from("invitations")
    .select("id, slug, title, status, published_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    showMessage("Gagal memuat undangan: " + error.message, true);
    return;
  }

  list.replaceChildren();

  if (!data?.length) {
    const empty = document.createElement("p");
    empty.textContent = "Anda belum membuat undangan.";
    list.append(empty);
    return;
  }

  for (const invitation of data) {
    const card = document.createElement("article");
    card.className = "invitation-setting-card";

    const title = document.createElement("h3");
    title.textContent = invitation.title || invitation.slug;

    const status = document.createElement("p");
    status.textContent =
      `Status: ${invitation.status === "published"
        ? "Dipublikasikan"
        : invitation.status === "draft"
          ? "Draft"
          : invitation.status}`;

    const actions = document.createElement("div");
    actions.className = "invitation-setting-actions";

    if (invitation.status === "draft") {
      actions.append(createButton("Publikasikan", async () => {
        const confirmed = window.confirm(
          "Publikasikan undangan ini agar bisa dibuka tamu?"
        );
        if (!confirmed) return;

        const { error: updateError } = await supabase
          .from("invitations")
          .update({
            status: "published",
            published_at: new Date().toISOString()
          })
          .eq("id", invitation.id)
          .eq("user_id", user.id)
          .eq("status", "draft");

        if (updateError) {
          showMessage(
            "Gagal memublikasikan. Pastikan aturan database mengizinkan pemilik mengubah status. " +
            updateError.message,
            true
          );
          return;
        }

        showMessage("Undangan berhasil dipublikasikan.");
        await loadInvitations();
      }));
    } else if (invitation.status === "published") {
      actions.append(createButton("Jadikan Draft", async () => {
        const confirmed = window.confirm(
          "Sembunyikan undangan ini dari publik?"
        );
        if (!confirmed) return;

        const { error: updateError } = await supabase
          .from("invitations")
          .update({ status: "draft" })
          .eq("id", invitation.id)
          .eq("user_id", user.id)
          .eq("status", "published");

        if (updateError) {
          showMessage(
            "Gagal mengubah status: " + updateError.message,
            true
          );
          return;
        }

        showMessage("Undangan sekarang berstatus draft.");
        await loadInvitations();
      }));

      actions.append(createButton("Salin Link", async () => {
        const url = new URL(
          `/${encodeURIComponent(invitation.slug)}/`,
          window.location.origin
        ).href;

        try {
          await navigator.clipboard.writeText(url);
          showMessage("Link undangan berhasil disalin.");
        } catch {
          window.prompt("Salin link undangan ini:", url);
        }
      }));
    }

    card.append(title, status, actions);
    list.append(card);
  }
}

loadInvitations();
