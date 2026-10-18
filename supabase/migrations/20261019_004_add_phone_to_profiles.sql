-- Tambahkan kolom phone pada tabel profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Perbarui fungsi trigger untuk memasukkan data nomor telepon
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Pengguna'), 
    'client',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
