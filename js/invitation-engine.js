import { supabase } from '/js/config/supabase.js';
import { formatDateShort } from '/js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Ekstrak Slug dari URL path (misal: /anisa-bagas -> anisa-bagas)
  let path = window.location.pathname.replace(/^\/|\/$/g, '');

  // Jika path mengarah ke file sistem/invitation.html, ambil dari query param atau referrer fallback
  if (!path || path === 'invitation.html' || path === 'invitation') {
    const params = new URLSearchParams(window.location.search);
    path = params.get('slug') || '';
  }

  // Abort jika memang tidak ada slug
  if (!path || path.includes('.html')) return;

  // Extract Parameter Tamu Undangan (?to=Tamu+Undangan)
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || 'Tamu Undangan';

  // 2. Fetch Master Undangan beserta Relasi Data
  const { data: inv, error } = await supabase
    .from('invitations')
    .select(`
      *,
      themes(*),
      invitation_couples(*),
      invitation_events(*),
      invitation_stories(*),
      invitation_galleries(*),
      invitation_bank_accounts(*),
      invitation_gift_addresses(*),
      quotes(*),
      musics(*)
    `)
    .eq('slug', path)
    .single();

  if (error || !inv) {
    console.error('Undangan tidak ditemukan untuk slug:', path);
    const container = document.getElementById('app') || document.body;
    container.innerHTML = `
      <div style="text-align:center; padding:100px 20px; font-family:sans-serif;">
        <h2>Undangan Tidak Ditemukan</h2>
        <p>Maaf, link undangan dengan slug <strong>"${path}"</strong> tidak terdaftar atau belum aktif.</p>
      </div>
    `;
    return;
  }

  // Inject SEO Meta Tags
  document.title = inv.meta_title || inv.title;
  setMetaTag('description', inv.meta_description || inv.title);
  setMetaTag('og:title', inv.meta_title || inv.title);
  setMetaTag('og:description', inv.meta_description || inv.title);
  if (inv.meta_image_url) setMetaTag('og:image', inv.meta_image_url);

  // Inject Data ke DOM Template
  renderInvitationDOM(inv, guestName);
});

// Sisa fungsi setMetaTag, renderInvitationDOM, loadWishesList, dst tetap sama...


function setMetaTag(property, content) {
  let element = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    if (property.startsWith('og:')) {
      element.setAttribute('property', property);
    } else {
      element.setAttribute('name', property);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function renderInvitationDOM(inv, guestName) {
  // A. Nama Tamu
  const guestElements = document.querySelectorAll('.data-guest-name');
  guestElements.forEach(el => el.innerText = guestName);

  // B. Cover & Judul Utama
  setTextContent('.data-invitation-title', inv.title);
  setTextContent('.data-event-date', formatDateShort(inv.event_date));
  setImageSrc('.data-cover-photo', inv.cover_photo_url);
  setImageSrc('.data-closing-photo', inv.closing_photo_url);

  // C. Groom & Bride Data
  const groom = inv.invitation_couples?.find(c => c.gender === 'groom');
  const bride = inv.invitation_couples?.find(c => c.gender === 'bride');

  if (groom) {
    setTextContent('.data-groom-name', groom.full_name);
    setTextContent('.data-groom-short', groom.short_name);
    setTextContent('.data-groom-parents', `Putra dari Bapak ${groom.father_name || ''} & Ibu ${groom.mother_name || ''}`);
    setImageSrc('.data-groom-photo', groom.photo_url);
    setHref('.data-groom-ig', groom.instagram_url);
  }

  if (bride) {
    setTextContent('.data-bride-name', bride.full_name);
    setTextContent('.data-bride-short', bride.short_name);
    setTextContent('.data-bride-parents', `Putri dari Bapak ${bride.father_name || ''} & Ibu ${bride.mother_name || ''}`);
    setImageSrc('.data-bride-photo', bride.photo_url);
    setHref('.data-bride-ig', bride.instagram_url);
  }

  // D. Quotes & Backsound Music
  if (inv.quotes) {
    setTextContent('.data-quote-content', `"${inv.quotes.content}"`);
    setTextContent('.data-quote-source', inv.quotes.source);
  }
  if (inv.musics) {
    const audioPlayer = document.getElementById('audio-backsound');
    if (audioPlayer) audioPlayer.src = inv.musics.audio_url;
  }

  // E. Dynamic Events List
  const eventContainer = document.getElementById('events-container');
  if (eventContainer && inv.invitation_events) {
    eventContainer.innerHTML = inv.invitation_events.map(ev => `
      <div class="event-card">
        <h3>${ev.event_title}</h3>
        <p class="date">${formatDateShort(ev.event_date)}</p>
        <p class="time">Pukul ${ev.start_time} - ${ev.end_time || 'Selesai'}</p>
        <p class="venue"><strong>${ev.venue_name}</strong></p>
        <p class="address">${ev.address}</p>
        ${ev.google_maps_url ? `<a href="${ev.google_maps_url}" target="_blank" class="btn-map">Google Maps</a>` : ''}
      </div>
    `).join('');
  }

  // F. Dynamic Stories List
  const storyContainer = document.getElementById('stories-container');
  if (storyContainer && inv.invitation_stories) {
    storyContainer.innerHTML = inv.invitation_stories.map(st => `
      <div class="story-item">
        ${st.photo_url ? `<img src="${st.photo_url}" class="story-img">` : ''}
        <h4>${st.title} (${st.date_str})</h4>
        <p>${st.description}</p>
      </div>
    `).join('');
  }

  // G. Dynamic Galleries List
  const galleryContainer = document.getElementById('galleries-container');
  if (galleryContainer && inv.invitation_galleries) {
    galleryContainer.innerHTML = inv.invitation_galleries.map(g => `
      <div class="gallery-item">
        ${g.media_type === 'video' 
          ? `<video src="${g.media_url}" controls></video>` 
          : `<img src="${g.media_url}" alt="Gallery">`}
      </div>
    `).join('');
  }

  // H. Rekening Digital & Copy to Clipboard
  const bankContainer = document.getElementById('bank-container');
  if (bankContainer && inv.invitation_bank_accounts) {
    bankContainer.innerHTML = inv.invitation_bank_accounts.map(b => `
      <div class="bank-card">
        <h4>${b.bank_name}</h4>
        <p class="account-num" id="acc-${b.id}">${b.account_number}</p>
        <p class="account-holder">a.n ${b.account_holder}</p>
        <button class="btn-copy" onclick="navigator.clipboard.writeText('${b.account_number}')">Salin No. Rekening</button>
      </div>
    `).join('');
  }

  // I. Handle Form Submit RSVP ke Supabase
  const rsvpForm = document.getElementById('form-rsvp');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvp-name').value;
      const status = document.getElementById('rsvp-status').value;
      const pax = document.getElementById('rsvp-pax').value;
      const message = document.getElementById('rsvp-message').value;

      await supabase.from('rsvps_and_wishes').insert({
        invitation_id: inv.id,
        guest_name: name,
        attendance_status: status,
        pax_count: parseInt(pax, 10) || 1,
        message: message
      });

      alert('Terima kasih! Ucapan & konfirmasi kehadiran Anda telah terkirim.');
      rsvpForm.reset();
      loadWishesList(inv.id);
    });
  }

  loadWishesList(inv.id);
}

// Fetch & Display Realtime Wishes List
async function loadWishesList(invitationId) {
  const wishesContainer = document.getElementById('wishes-list');
  if (!wishesContainer) return;

  const { data: list } = await supabase
    .from('rsvps_and_wishes')
    .select('*')
    .eq('invitation_id', invitationId)
    .order('created_at', { ascending: false });

  if (!list || list.length === 0) {
    wishesContainer.innerHTML = '<p class="no-wishes">Belum ada ucapan.</p>';
    return;
  }

  wishesContainer.innerHTML = list.map(w => `
    <div class="wish-card">
      <div class="wish-header">
        <strong>${w.guest_name}</strong>
        <span class="badge-status-sm">${w.attendance_status}</span>
      </div>
      <p class="wish-msg">${w.message}</p>
      <span class="wish-time">${formatDateShort(w.created_at)}</span>
    </div>
  `).join('');
}

// Helper Functions
function setTextContent(selector, text) {
  const el = document.querySelector(selector);
  if (el && text) el.innerText = text;
}
function setImageSrc(selector, src) {
  const el = document.querySelector(selector);
  if (el && src) el.src = src;
}
function setHref(selector, href) {
  const el = document.querySelector(selector);
  if (el && href) el.href = href;
}
