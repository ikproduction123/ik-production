
-- IK Production: pengamanan pembuatan undangan
-- Jalankan setelah migration 001 berhasil.

create or replace function private.validate_invitation_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_limit integer;
  v_used integer;
  v_expires_at timestamptz;
  v_status text;
begin
  -- Harus berasal dari pengguna yang sedang login.
  if auth.uid() is null then
    raise exception 'Login diperlukan untuk mengelola undangan.';
  end if;

  if tg_op = 'UPDATE' then
    -- Pelanggan tidak boleh memindahkan undangan ke akun,
    -- langganan, atau tema lain lewat UPDATE biasa.
    if new.user_id is distinct from old.user_id
       or new.subscription_id is distinct from old.subscription_id
       or new.theme_id is distinct from old.theme_id then
      raise exception
        'Pemilik, langganan, dan tema tidak boleh diubah lewat UPDATE.';
    end if;

    -- Validasi perubahan status juga dilakukan untuk pemiliknya.
    if old.user_id <> auth.uid()
       and not private.is_admin() then
      raise exception 'Tidak memiliki izin mengubah undangan.';
    end if;

    -- Admin dapat mengelola undangan tanpa validasi paket pelanggan.
    if private.is_admin() then
      return new;
    end if;

    return new;
  end if;

  -- Admin boleh membuat undangan untuk keperluan pengelolaan.
  if private.is_admin() then
    return new;
  end if;

  if new.user_id <> auth.uid() then
    raise exception 'Tidak boleh membuat undangan untuk akun lain.';
  end if;

  if new.subscription_id is null then
    raise exception 'Paket berlangganan diperlukan.';
  end if;

  -- Kunci baris langganan agar dua permintaan bersamaan
  -- tidak melewati batas paket dengan mudah.
  select s.status, s.expires_at, s.plan_id
    into v_status, v_expires_at, v_plan_id
  from public.subscriptions s
  where s.id = new.subscription_id
    and s.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Langganan tidak ditemukan atau bukan milik Anda.';
  end if;

  if v_status <> 'active'
     or v_expires_at is null
     or v_expires_at <= now() then
    raise exception 'Langganan tidak aktif atau sudah kedaluwarsa.';
  end if;

  select p.invitation_limit
    into v_limit
  from public.plans p
  where p.id = v_plan_id
    and p.is_active = true;

  if not found then
    raise exception 'Paket tidak aktif atau tidak ditemukan.';
  end if;

  -- Tema harus aktif dan terhubung ke paket langganan.
  if not exists (
    select 1
    from public.plan_themes pt
    join public.themes t on t.id = pt.theme_id
    where pt.plan_id = v_plan_id
      and pt.theme_id = new.theme_id
      and t.is_active = true
  ) then
    raise exception 'Tema tidak tersedia untuk paket Anda.';
  end if;

  select count(*)::integer
    into v_used
  from public.invitations i
  where i.subscription_id = new.subscription_id;

  if v_used >= v_limit then
    raise exception 'Batas undangan paket telah tercapai.';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_invitation_write() from public;
revoke all on function private.validate_invitation_write() from anon;
revoke all on function private.validate_invitation_write() from authenticated;

drop trigger if exists validate_invitation_write_trigger
  on public.invitations;

create trigger validate_invitation_write_trigger
before insert or update on public.invitations
for each row
execute function private.validate_invitation_write();
