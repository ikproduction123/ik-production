-- Tipe Data Custom
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('draft', 'published', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;



-- Tabel INVITATIONS (Revisi: Fokus pada metadata, slug, dan status)
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  theme_id UUID REFERENCES themes(id) ON DELETE RESTRICT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status invitation_status DEFAULT 'draft' NOT NULL,
  title TEXT,
  cover_img TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_img TEXT,
  music_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS Invitations
CREATE POLICY "Users can CRUD own invitations" ON invitations 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read published invitations" ON invitations 
  FOR SELECT USING (status = 'published');

-- Memastikan skema storage tersedia sebelum insert
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Membuat Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('invitation-assets', 'invitation-assets', true),
  ('theme-assets', 'theme-assets', true),
  ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Storage
CREATE POLICY "Public Access invitation-assets" ON storage.objects FOR SELECT USING (bucket_id = 'invitation-assets');
CREATE POLICY "User Manage invitation-assets" ON storage.objects FOR ALL USING (bucket_id = 'invitation-assets' AND auth.uid() = owner);
CREATE POLICY "User Manage payment-proofs" ON storage.objects FOR ALL USING (bucket_id = 'payment-proofs' AND auth.uid() = owner);
