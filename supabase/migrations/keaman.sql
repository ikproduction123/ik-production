
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
