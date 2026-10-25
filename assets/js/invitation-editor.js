
import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);

const form = $("invitationEditorForm");
const selector = $("editorInvitation");
const message = $("editorMessage");
const saveButton = $("saveEditorButton");
const previewButton = $("previewEditorButton");

let currentUser = null;
let invitations = [];
let selectedInvitation = null;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#b42318" : "#217a45";
}

function getContentObject(content) {
  return content && typeof content === "object" && !Array.isArray(content)
    ? content
    : {};
}

function fillForm(invitation) {
  selectedInvitation = invitation;

  const content = getContentObject(invitation.content);
  const cover = content.cover || {};
  const story = content.story || {};

  $("editorHeadline").value = cover.headline || "";
  $("editorOpening").value = cover.opening_message || "";
  $("editorStoryTitle").value = story.title || "";
  $("editorStoryDescription").value = story.description || "";
  $("editorClosing").value = content.closing_message || "";

  previewButton.disabled = false;
}

async function loadEditor() {
  selector.disabled = true;
  form.querySelectorAll("input, textarea, button").forEach((el) => {
    if (el !== previewButton) el.disabled = true;
  });

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    showMessage("Silakan login kembali.", true);
    return;
  }

  currentUser = authData.user;

  const { data, error } = await supabase
    .from("invitations")
    .select("id, slug, title, status, content")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    showMessage("Gagal memuat undangan: " + error.message, true);
    return;
  }

  invitations = data || [];
  selector.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Pilih undangan";
  selector.append(placeholder);

  for (const invitation of invitations) {
    const option = document.createElement("option");
    option.value = invitation.id;
    option.textContent = `${invitation.title || invitation.slug} (${invitation.status})`;
    selector.append(option);
  }

  selector.disabled = false;
  form.querySelectorAll("input, textarea, button").forEach((el) => {
    el.disabled = false;
  });

  previewButton.disabled = true;

  if (invitations.length) {
    selector.value = invitations[0].id;
    fillForm(invitations[0]);
  } else {
    showMessage("Belum ada undangan untuk diedit.");
  }
}

selector.addEventListener("change", () => {
  const invitation = invitations.find(
    (item) => item.id === selector.value
  );

  if (invitation) {
    fillForm(invitation);
    showMessage("");
  } else {
    selectedInvitation = null;
    previewButton.disabled = true;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser || !selectedInvitation) {
    showMessage("Pilih undangan terlebih dahulu.", true);
    return;
  }

  saveButton.disabled = true;
  showMessage("Menyimpan perubahan...");

  try {
    // Ambil konten terbaru agar bagian lain seperti galeri dan musik
    // tidak ikut terhapus ketika form teks disimpan.
    const { data: latest, error: readError } = await supabase
      .from("invitations")
      .select("content")
      .eq("id", selectedInvitation.id)
      .eq("user_id", currentUser.id)
      .single();

    if (readError) throw readError;

    const content = getContentObject(latest.content);

    const updatedContent = {
      ...content,
      cover: {
        ...(content.cover || {}),
        headline: $("editorHeadline").value.trim(),
        opening_message: $("editorOpening").value.trim()
      },
      story: {
        ...(content.story || {}),
        enabled: true,
        title: $("editorStoryTitle").value.trim(),
        description: $("editorStoryDescription").value.trim()
      },
      closing_message: $("editorClosing").value.trim()
    };

    const { data: updated, error: updateError } = await supabase
      .from("invitations")
      .update({ content: updatedContent })
      .eq("id", selectedInvitation.id)
      .eq("user_id", currentUser.id)
      .select("id, slug, title, status, content")
      .single();

    if (updateError) throw updateError;

    selectedInvitation = updated;
    invitations = invitations.map((item) =>
      item.id === updated.id ? updated : item
    );

    showMessage("Konten undangan berhasil disimpan.");
  } catch (error) {
    console.error(error);
    showMessage(
      "Gagal menyimpan konten: " + error.message,
      true
    );
  } finally {
    saveButton.disabled = false;
  }
});

previewButton.addEventListener("click", () => {
  if (!selectedInvitation) return;

  const url = new URL(
    `/${encodeURIComponent(selectedInvitation.slug)}/`,
    window.location.origin
  );

  url.searchParams.set("preview", "1");

  // Preview ini menggunakan URL publik biasa. Parameter preview
  // belum memberi akses ke undangan draft.
  window.open(url.href, "_blank", "noopener,noreferrer");
});

loadEditor().catch((error) => {
  console.error(error);
  showMessage("Terjadi kesalahan saat memuat editor.", true);
});
