-- Tipe Data Custom
CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE package_tier AS ENUM ('Premium', 'Luxury', 'Motion');

-- Tabel PROFILES (Terkoneksi otomatis dengan auth.users Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'client' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel PACKAGES
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier package_tier NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB DEFAULT '{}'::jsonb,
  active_days INTEGER NOT NULL DEFAULT 365,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel THEMES
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tier package_tier NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS (Least Privilege)
-- Profiles: Pengguna hanya bisa update profilnya sendiri. Semua orang bisa melihat profil (bisa dibatasi nanti jika perlu).
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Packages & Themes: Publik hanya bisa membaca (Read-only untuk klien). Modifikasi hanya lewat admin/akses internal nantinya.
CREATE POLICY "Public read packages" ON packages FOR SELECT USING (true);
CREATE POLICY "Public read themes" ON themes FOR SELECT USING (true);
