-- Tabel COUPLES (Data Mempelai)
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  groom_name TEXT,
  groom_fullname TEXT,
  groom_parents TEXT,
  bride_name TEXT,
  bride_fullname TEXT,
  bride_parents TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel EVENTS (Data Acara seperti Akad & Resepsi)
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- e.g., 'akad', 'resepsi'
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  time_start TEXT,
  time_end TEXT,
  location_name TEXT,
  address TEXT,
  map_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS: Client hanya bisa CRUD data miliknya sendiri
CREATE POLICY "Users can CRUD own couples" ON couples FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own events" ON events FOR ALL USING (auth.uid() = user_id);

-- RLS: Publik bisa membaca data yang terhubung ke undangan 'published'
CREATE POLICY "Public read couples" ON couples FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = couples.invitation_id AND status = 'published')
);
CREATE POLICY "Public read events" ON events FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = events.invitation_id AND status = 'published')
);

-- Trigger untuk membuat row "couples" otomatis setiap ada undangan baru
CREATE OR REPLACE FUNCTION public.handle_new_invitation()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.couples (invitation_id, user_id)
  VALUES (new.id, new.user_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_invitation_created
  AFTER INSERT ON public.invitations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_invitation();
