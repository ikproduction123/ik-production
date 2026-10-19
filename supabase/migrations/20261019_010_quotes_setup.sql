-- 1. Tambahkan kolom kutipan ke tabel invitations
ALTER TABLE public.invitations 
  ADD COLUMN IF NOT EXISTS quote_text TEXT,
  ADD COLUMN IF NOT EXISTS quote_author TEXT;

-- 2. Buat tabel quotes_preset untuk galeri pilihan kata-kata
CREATE TABLE quotes_preset (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan RLS
ALTER TABLE quotes_preset ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read quotes_preset" ON quotes_preset FOR SELECT USING (true);

-- 3. Masukkan beberapa contoh pilihan kutipan (Agama & Umum)
INSERT INTO quotes_preset (text, author) VALUES
  ('Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang.', 'Q.S. Ar-Rum: 21'),
  ('Pernikahan adalah ibadah, dan setiap ibadah bermuara pada cinta-Nya sebagai tujuan utama.', 'Ali bin Abi Thalib'),
  ('Dua jiwa namun satu pikiran, dua hati namun satu perasaan.', 'John Keats'),
  ('Cinta tidak berupa tatapan satu sama lain, tetapi memandang ke luar bersama ke arah yang sama.', 'Antoine de Saint-Exupery')
ON CONFLICT DO NOTHING;
