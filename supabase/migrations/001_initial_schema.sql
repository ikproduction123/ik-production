
-- =====================================================
-- IK PRODUCTION: INITIAL DATABASE SCHEMA
-- HTML + CSS + VANILLA JS + SUPABASE
-- =====================================================

create extension if not exists pgcrypto;

create schema if not exists private;

-- =====================================================
-- 1. PROFILES
-- Satu profil untuk setiap akun Supabase Auth
-- =====================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jangan izinkan role ditentukan dari metadata pendaftaran.
-- Trigger hanya membuat profil customer.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();


-- =====================================================
-- 2. PLANS
-- Enam paket tahunan
-- =====================================================

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    check (code in (
      'basic', 'premium', 'luxury',
      'motion', 'acara-lain', 'all-in-one'
    )),
  name text not null,
  description text not null default '',
  price bigint not null check (price >= 0),
  duration_days integer not null default 365
    check (duration_days = 365),
  invitation_limit integer not null
    check (invitation_limit > 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =====================================================
-- 3. THEMES
-- Katalog tema undangan
-- =====================================================

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null
    check (category in ('wedding', 'other')),
  preview_image text,
  demo_url text,
  description text not null default '',
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);


-- =====================================================
-- 4. PLAN_THEMES
-- Hubungan many-to-many paket dan tema
-- =====================================================

create table public.plan_themes (
  plan_id uuid not null references public.plans(id)
    on delete cascade,
  theme_id uuid not null references public.themes(id)
    on delete cascade,
  primary key (plan_id, theme_id)
);


-- =====================================================
-- 5. SUBSCRIPTIONS
-- Riwayat langganan pelanggan
-- =====================================================

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id)
    on delete restrict,
  plan_id uuid not null references public.plans(id)
    on delete restrict,
  status text not null default 'pending'
    check (status in (
      'pending', 'active', 'expired', 'cancelled'
    )),
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (status <> 'active')
    or (
      started_at is not null
      and expires_at is not null
      and expires_at > started_at
    )
  )
);


-- =====================================================
-- 6. INVITATIONS
-- Data undangan dan URL publik pelanggan
-- =====================================================

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id)
    on delete restrict,
  subscription_id uuid not null
    references public.subscriptions(id)
    on delete restrict,
  theme_id uuid not null references public.themes(id)
    on delete restrict,

  slug text not null unique
    check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and length(slug) between 3 and 80
    ),

  title text not null default '',
  event_type text not null default 'wedding',
  event_date timestamptz,
  venue_name text,
  venue_address text,
  maps_url text,
  host_names jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,

  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =====================================================
-- 7. PAYMENTS
-- Konfirmasi pembayaran transfer secara manual
-- =====================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null
    references public.subscriptions(id)
    on delete restrict,

  amount bigint not null check (amount >= 0),
  method text not null default 'bank_transfer'
    check (method = 'bank_transfer'),

  proof_path text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),

  admin_note text,
  verified_by uuid references auth.users(id)
    on delete set null,
  verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =====================================================
-- 8. INDEXES
-- Mempercepat pencarian dan relasi
-- =====================================================

create index subscriptions_user_id_idx
  on public.subscriptions(user_id);

create index subscriptions_status_idx
  on public.subscriptions(status);

create index invitations_user_id_idx
  on public.invitations(user_id);

create index invitations_subscription_id_idx
  on public.invitations(subscription_id);

create index invitations_theme_id_idx
  on public.invitations(theme_id);

create index invitations_public_idx
  on public.invitations(slug)
  where status = 'published';

create index payments_subscription_id_idx
  on public.payments(subscription_id);

create index plan_themes_theme_id_idx
  on public.plan_themes(theme_id);


-- =====================================================
-- 9. ADMIN CHECK
-- Gunakan fungsi private agar policy tidak rekursif
-- =====================================================

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;


-- =====================================================
-- 10. ENABLE RLS
-- =====================================================

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.themes enable row level security;
alter table public.plan_themes enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invitations enable row level security;
alter table public.payments enable row level security;


-- =====================================================
-- 11. PRIVILEGES
-- Batasi hak akses berdasarkan kebutuhan
-- =====================================================

revoke all on table
  public.profiles,
  public.plans,
  public.themes,
  public.plan_themes,
  public.subscriptions,
  public.invitations,
  public.payments
from anon, authenticated;

grant select on public.plans, public.themes,
  public.plan_themes to anon, authenticated;

grant select, update on public.profiles to authenticated;

grant select on public.subscriptions to authenticated;
grant select on public.payments to authenticated;

grant select, insert, update, delete
  on public.invitations to authenticated;


-- =====================================================
-- 12. RLS POLICIES: PROFILES
-- Pelanggan hanya membaca dan mengubah profil sendiri.
-- Role tidak boleh diubah melalui policy ini.
-- =====================================================

create policy "profile_select_own_or_admin"
on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

create policy "profile_update_own"
on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "profile_admin_select_all"
on public.profiles
for select to authenticated
using ((select private.is_admin()));

create policy "profile_admin_update_all"
on public.profiles
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));


-- =====================================================
-- 13. RLS POLICIES: PLANS & THEMES
-- Pengunjung hanya melihat paket/tema aktif.
-- Admin dapat melihat dan mengelola katalog.
-- =====================================================

create policy "plans_read_active"
on public.plans
for select to anon, authenticated
using (
  is_active = true
  or (select private.is_admin())
);

create policy "plans_admin_insert"
on public.plans
for insert to authenticated
with check ((select private.is_admin()));

create policy "plans_admin_update"
on public.plans
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "plans_admin_delete"
on public.plans
for delete to authenticated
using ((select private.is_admin()));


create policy "themes_read_active"
on public.themes
for select to anon, authenticated
using (
  is_active = true
  or (select private.is_admin())
);

create policy "themes_admin_insert"
on public.themes
for insert to authenticated
with check ((select private.is_admin()));

create policy "themes_admin_update"
on public.themes
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "themes_admin_delete"
on public.themes
for delete to authenticated
using ((select private.is_admin()));


create policy "plan_themes_read_catalog"
on public.plan_themes
for select to anon, authenticated
using (
  exists (
    select 1 from public.plans p
    where p.id = plan_id and p.is_active = true
  )
  and exists (
    select 1 from public.themes t
    where t.id = theme_id and t.is_active = true
  )
  or (select private.is_admin())
);

create policy "plan_themes_admin_insert"
on public.plan_themes
for insert to authenticated
with check ((select private.is_admin()));

create policy "plan_themes_admin_delete"
on public.plan_themes
for delete to authenticated
using ((select private.is_admin()));


-- =====================================================
-- 14. RLS POLICIES: SUBSCRIPTIONS
-- Pelanggan hanya dapat membaca langganan sendiri.
-- Pembuatan dan perubahan status dilakukan backend/admin.
-- =====================================================

create policy "subscriptions_read_own_or_admin"
on public.subscriptions
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "subscriptions_admin_insert"
on public.subscriptions
for insert to authenticated
with check ((select private.is_admin()));

create policy "subscriptions_admin_update"
on public.subscriptions
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "subscriptions_admin_delete"
on public.subscriptions
for delete to authenticated
using ((select private.is_admin()));


-- =====================================================
-- 15. RLS POLICIES: INVITATIONS
-- Pemilik mengelola undangannya.
-- Undangan published dapat dibaca publik.
-- =====================================================

create policy "invitations_read_owner_admin_or_published"
on public.invitations
for select to anon, authenticated
using (
  status = 'published'
  or user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "invitations_insert_owner"
on public.invitations
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.subscriptions s
    where s.id = subscription_id
      and s.user_id = (select auth.uid())
  )
);

create policy "invitations_update_owner"
on public.invitations
for update to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
);

create policy "invitations_delete_owner_or_admin"
on public.invitations
for delete to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);


-- =====================================================
-- 16. RLS POLICIES: PAYMENTS
-- Pelanggan hanya dapat membaca pembayaran langganan sendiri.
-- Insert dan verifikasi disiapkan untuk backend/admin.
-- =====================================================

create policy "payments_read_owner_or_admin"
on public.payments
for select to authenticated
using (
  exists (
    select 1
    from public.subscriptions s
    where s.id = subscription_id
      and s.user_id = (select auth.uid())
  )
  or (select private.is_admin())
);

create policy "payments_admin_insert"
on public.payments
for insert to authenticated
with check ((select private.is_admin()));

create policy "payments_admin_update"
on public.payments
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "payments_admin_delete"
on public.payments
for delete to authenticated
using ((select private.is_admin()));


-- =====================================================
-- END OF INITIAL SCHEMA
-- =====================================================

-- =====================================================
-- SECURITY PATCH
-- =====================================================

-- Izinkan admin mengelola katalog.
-- Policy RLS tetap membatasi baris yang bisa diubah.
grant insert, update, delete
  on public.plans,
     public.themes
  to authenticated;

grant insert, delete
  on public.plan_themes
  to authenticated;


-- Mencegah pengguna mengubah role sendiri.
create or replace function private.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and not coalesce(private.is_admin(), false) then
    raise exception 'Only an admin can change profile roles';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_profile_role() from public;

drop trigger if exists protect_profile_role_trigger
  on public.profiles;

create trigger protect_profile_role_trigger
before update on public.profiles
for each row
execute function private.protect_profile_role();
