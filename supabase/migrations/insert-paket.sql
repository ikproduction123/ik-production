
insert into public.plans
  (code, name, description, price, duration_days, invitation_limit, display_order)
values
  ('basic', 'Basic', 'Undangan digital sederhana', 99000, 365, 1, 1),
  ('premium', 'Premium', 'Tema premium untuk momen spesial', 149000, 365, 3, 2),
  ('luxury', 'Luxury', 'Tema undangan eksklusif', 199000, 365, 5, 3),
  ('motion', 'Motion', 'Tema undangan dengan animasi', 249000, 365, 5, 4),
  ('acara-lain', 'Acara Lain', 'Undangan untuk berbagai jenis acara', 99000, 365, 1, 5),
  ('all-in-one', 'All In One', 'Akses tema dari semua kategori', 399000, 365, 10, 6);
