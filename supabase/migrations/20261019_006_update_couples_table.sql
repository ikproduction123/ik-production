-- Menghapus kolom gabungan orang tua yang lama
ALTER TABLE public.couples 
  DROP COLUMN IF EXISTS groom_parents,
  DROP COLUMN IF EXISTS bride_parents;

-- Menambahkan kolom spesifik untuk Mempelai Pria (Groom)
ALTER TABLE public.couples 
  ADD COLUMN IF NOT EXISTS groom_father TEXT,
  ADD COLUMN IF NOT EXISTS groom_mother TEXT,
  ADD COLUMN IF NOT EXISTS groom_photo TEXT,
  ADD COLUMN IF NOT EXISTS groom_instagram TEXT;

-- Menambahkan kolom spesifik untuk Mempelai Wanita (Bride)
ALTER TABLE public.couples 
  ADD COLUMN IF NOT EXISTS bride_father TEXT,
  ADD COLUMN IF NOT EXISTS bride_mother TEXT,
  ADD COLUMN IF NOT EXISTS bride_photo TEXT,
  ADD COLUMN IF NOT EXISTS bride_instagram TEXT;

-- Catatan:
-- groom_name / bride_name akan digunakan untuk "Nama Pendek"
-- groom_fullname / bride_fullname akan digunakan untuk "Nama Panjang"
