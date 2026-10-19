-- Mengubah tipe kolom event_date dari TIMESTAMPTZ menjadi TEXT
ALTER TABLE public.events ALTER COLUMN event_date TYPE TEXT USING event_date::text;
