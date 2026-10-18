import SoftBlossom from './premium/SoftBlossom';

// Registry memetakan slug dari Supabase ke Komponen React
export const themeRegistry = {
  'soft-blossom': SoftBlossom,
  // Tema lain akan didaftarkan di sini seiring berjalannya waktu
};

export const getThemeComponent = (slug) => {
  return themeRegistry[slug] || null;
};
