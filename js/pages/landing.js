import { supabase } from '../config/supabase.js';
import { formatRupiah } from '../utils/helpers.js';
import { animateCounter } from '../utils/counter.js';

let allThemes = [];
let activeCategory = 'wedding';
let activePackageFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadPackages();
  await loadThemes();
  setupTabListeners();
});

// 1. Fetch & Animate Realtime Stats
async function loadStats() {
  const [invitationsRes, themesRes, wishesRes, rsvpRes] = await Promise.all([
    supabase.from('invitations').select('id', { count: 'exact', head: true }),
    supabase.from('themes').select('id', { count: 'exact', head: true }),
    supabase.from('rsvps_and_wishes').select('id', { count: 'exact', head: true }),
    supabase.from('rsvps_and_wishes').select('pax_count')
  ]);

  const totalInvitations = invitationsRes.count || 0;
  const totalThemes = themesRes.count || 0;
  const totalWishes = wishesRes.count || 0;
  
  // Perkiraan undangan disebar dari akumulasi tamu
  const totalPax = (rsvpRes.data || []).reduce((acc, curr) => acc + (curr.pax_count || 1), 0);
  const totalShares = totalInvitations * 25 + totalPax;

  animateCounter('stat-invitations', totalInvitations);
  animateCounter('stat-themes', totalThemes);
  animateCounter('stat-wishes', totalWishes);
  animateCounter('stat-shares', totalShares);
}

// 2. Fetch Packages from Supabase
async function loadPackages() {
  const container = document.getElementById('harga-container');
  if (!container) return;

  const { data: packages, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: false });

  if (error || !packages) {
    container.innerHTML = '<p>Gagal memuat harga paket.</p>';
    return;
  }

  container.innerHTML = packages.map(pkg => {
    const featuresList = (pkg.features || []).map(f => `<li>✓ ${f}</li>`).join('');
    return `
      <div class="harga-card">
        <h3>${pkg.name}</h3>
        <div class="price">${formatRupiah(pkg.price)}</div>
        <p class="duration">Masa aktif ${pkg.active_duration_days} Hari</p>
        <ul class="features-list">
          ${featuresList}
        </ul>
        <a href="/register.html?package=${pkg.slug}" class="btn-primary btn-full">Pilih Paket</a>
      </div>
    `;
  }).join('');
}

// 3. Fetch Themes from Supabase
async function loadThemes() {
  const { data, error } = await supabase
    .from('themes')
    .select('*, packages(name, slug, price)')
    .eq('is_active', true);

  if (!error && data) {
    allThemes = data;
    renderThemes();
  }
}

// 4. Render Theme Cards based on Filters
function renderThemes() {
  const container = document.getElementById('tema-container');
  if (!container) return;

  let filtered = allThemes.filter(t => t.category === activeCategory);

  if (activeCategory === 'wedding' && activePackageFilter !== 'all') {
    filtered = filtered.filter(t => t.packages?.slug === activePackageFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>Belum ada tema pada kategori ini.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(theme => `
    <div class="tema-card">
      <div class="tema-img-wrapper">
        <img src="${theme.thumbnail_url || '/assets/mockups/hero-mockup.png'}" alt="${theme.theme_name}">
        <span class="badge-pkg">${theme.packages?.name || 'Paket'}</span>
      </div>
      <div class="tema-info">
        <h3>${theme.theme_name}</h3>
        <p class="price-tag">${formatRupiah(theme.packages?.price || 0)}</p>
        <div class="tema-actions">
          <a href="/${theme.theme_slug}-demo" target="_blank" class="btn-outline btn-sm">Live Preview</a>
          <a href="/register.html?theme=${theme.id}" class="btn-primary btn-sm">Pesan</a>
        </div>
      </div>
    </div>
  `).join('');
}

// 5. Setup Tab Event Listeners
function setupTabListeners() {
  const mainTabs = document.querySelectorAll('.btn-tab');
  const subTabsContainer = document.getElementById('wedding-subtabs');
  const subTabs = document.querySelectorAll('.btn-subtab');

  mainTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      mainTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeCategory = btn.dataset.category;

      if (activeCategory === 'other') {
        subTabsContainer.style.display = 'none';
      } else {
        subTabsContainer.style.display = 'flex';
      }

      renderThemes();
    });
  });

  subTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      subTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activePackageFilter = btn.dataset.package;
      renderThemes();
    });
  });
}
