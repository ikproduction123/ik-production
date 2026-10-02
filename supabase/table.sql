-- =========================================================
-- IK-PRO.MY.ID
-- DATABASE SAAS UNDANGAN DIGITAL
-- SUPABASE / POSTGRESQL
-- =========================================================

-- =========================================================
-- 1. EXTENSIONS
-- =========================================================

create extension if not exists pgcrypto;


-- =========================================================
-- 2. ENUM TYPES
-- =========================================================

do $$
begin

    if not exists (
        select 1 from pg_type where typname = 'user_role'
    ) then
        create type user_role as enum ('admin', 'client');
    end if;

    if not exists (
        select 1 from pg_type where typname = 'invitation_status'
    ) then
        create type invitation_status as enum (
            'draft',
            'published',
            'expired'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'transaction_status'
    ) then
        create type transaction_status as enum (
            'pending',
            'approved',
            'rejected'
        );
    end if;

end
$$;


-- =========================================================
-- 3. FUNCTION UPDATED_AT
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- =========================================================
-- 4. PROFILES
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    name varchar(100),
    phone varchar(30),

    role user_role not null default 'client',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 5. THEMES
-- =========================================================

create table if not exists public.themes (
    id uuid primary key default gen_random_uuid(),

    name varchar(150) not null,
    slug varchar(150) unique not null,

    category varchar(50) not null,
    description text,

    preview_image text,
    thumbnail_image text,

    is_premium boolean not null default false,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 6. PACKAGES
-- =========================================================

create table if not exists public.packages (
    id uuid primary key default gen_random_uuid(),

    name varchar(100) not null,
    slug varchar(100) unique not null,

    description text,

    price numeric(14,2) not null default 0,

    duration_days integer not null default 30,

    features jsonb not null default '[]'::jsonb,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 7. INVITATIONS
-- =========================================================

create table if not exists public.invitations (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    theme_id uuid
        references public.themes(id)
        on delete set null,

    package_id uuid
        references public.packages(id)
        on delete set null,

    title varchar(200),

    slug varchar(150) not null unique,

    status invitation_status not null default 'draft',

    seo_title varchar(200),
    seo_description text,
    seo_image text,

    guest_name varchar(150),

    published_at timestamptz,
    expired_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint invitations_slug_format
        check (
            slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
        )
);


-- =========================================================
-- 8. COUPLES
-- =========================================================

create table if not exists public.couples (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null unique
        references public.invitations(id)
        on delete cascade,

    groom_full_name varchar(150),
    groom_short_name varchar(100),

    groom_mother_name varchar(150),
    groom_father_name varchar(150),

    groom_photo text,
    groom_instagram varchar(150),

    bride_full_name varchar(150),
    bride_short_name varchar(100),

    bride_mother_name varchar(150),
    bride_father_name varchar(150),

    bride_photo text,
    bride_instagram varchar(150),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 9. QUOTES
-- =========================================================

create table if not exists public.quotes (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    quote text not null,

    author varchar(150),

    sort_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 10. EVENTS
-- =========================================================

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    event_type varchar(50),

    title varchar(150),

    event_date date,
    start_time time,
    end_time time,

    location_name varchar(200),
    address text,

    maps_url text,

    description text,

    sort_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 11. STORIES
-- =========================================================

create table if not exists public.stories (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    title varchar(150),

    story_date date,

    content text,

    image_url text,

    sort_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 12. GALLERIES
-- =========================================================

create table if not exists public.galleries (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    image_url text not null,

    caption varchar(255),

    sort_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 13. GUESTS
-- =========================================================

create table if not exists public.guests (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    name varchar(150) not null,

    phone varchar(30),

    category varchar(100),

    token varchar(100) unique,

    invitation_sent boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 14. RSVP
-- =========================================================

create table if not exists public.rsvp (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    guest_id uuid
        references public.guests(id)
        on delete set null,

    name varchar(150) not null,

    attendance varchar(30)
        check (
            attendance in (
                'hadir',
                'tidak_hadir',
                'ragu'
            )
        ),

    number_of_guests integer not null default 1
        check (number_of_guests > 0),

    message text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 15. WISHES
-- =========================================================

create table if not exists public.wishes (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    name varchar(150) not null,

    message text not null,

    is_visible boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 16. WALLETS / REKENING PEMBAYARAN
-- =========================================================

create table if not exists public.wallets (
    id uuid primary key default gen_random_uuid(),

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    type varchar(30) not null,

    bank_name varchar(100),
    account_number varchar(100),
    account_name varchar(150),

    phone_number varchar(30),

    sort_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint wallets_type_check
        check (
            type in (
                'bank',
                'dana',
                'ovo',
                'gopay',
                'shopeepay'
            )
        )
);


-- =========================================================
-- 17. TRANSACTIONS
-- =========================================================

create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    invitation_id uuid not null
        references public.invitations(id)
        on delete cascade,

    package_id uuid
        references public.packages(id)
        on delete set null,

    amount numeric(14,2) not null default 0,

    payment_method varchar(50)
        default 'manual_transfer',

    payment_proof text,

    status transaction_status not null default 'pending',

    admin_note text,

    paid_at timestamptz,
    approved_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 18. INDEX
-- =========================================================

create index if not exists idx_invitations_user_id
    on public.invitations(user_id);

create index if not exists idx_invitations_slug
    on public.invitations(slug);

create index if not exists idx_invitations_status
    on public.invitations(status);

create index if not exists idx_couples_invitation_id
    on public.couples(invitation_id);

create index if not exists idx_events_invitation_id
    on public.events(invitation_id);

create index if not exists idx_galleries_invitation_id
    on public.galleries(invitation_id);

create index if not exists idx_guests_invitation_id
    on public.guests(invitation_id);

create index if not exists idx_rsvp_invitation_id
    on public.rsvp(invitation_id);

create index if not exists idx_stories_invitation_id
    on public.stories(invitation_id);

create index if not exists idx_quotes_invitation_id
    on public.quotes(invitation_id);

create index if not exists idx_wishes_invitation_id
    on public.wishes(invitation_id);

create index if not exists idx_wallets_invitation_id
    on public.wallets(invitation_id);

create index if not exists idx_transactions_user_id
    on public.transactions(user_id);

create index if not exists idx_transactions_invitation_id
    on public.transactions(invitation_id);


-- =========================================================
-- 19. UPDATED_AT TRIGGERS
-- =========================================================

drop trigger if exists profiles_updated_at
on public.profiles;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


drop trigger if exists themes_updated_at
on public.themes;

create trigger themes_updated_at
before update on public.themes
for each row
execute function public.set_updated_at();


drop trigger if exists packages_updated_at
on public.packages;

create trigger packages_updated_at
before update on public.packages
for each row
execute function public.set_updated_at();


drop trigger if exists invitations_updated_at
on public.invitations;

create trigger invitations_updated_at
before update on public.invitations
for each row
execute function public.set_updated_at();


drop trigger if exists couples_updated_at
on public.couples;

create trigger couples_updated_at
before update on public.couples
for each row
execute function public.set_updated_at();


drop trigger if exists quotes_updated_at
on public.quotes;

create trigger quotes_updated_at
before update on public.quotes
for each row
execute function public.set_updated_at();


drop trigger if exists events_updated_at
on public.events;

create trigger events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();


drop trigger if exists stories_updated_at
on public.stories;

create trigger stories_updated_at
before update on public.stories
for each row
execute function public.set_updated_at();


drop trigger if exists galleries_updated_at
on public.galleries;

create trigger galleries_updated_at
before update on public.galleries
for each row
execute function public.set_updated_at();


drop trigger if exists guests_updated_at
on public.guests;

create trigger guests_updated_at
before update on public.guests
for each row
execute function public.set_updated_at();


drop trigger if exists rsvp_updated_at
on public.rsvp;

create trigger rsvp_updated_at
before update on public.rsvp
for each row
execute function public.set_updated_at();


drop trigger if exists wishes_updated_at
on public.wishes;

create trigger wishes_updated_at
before update on public.wishes
for each row
execute function public.set_updated_at();


drop trigger if exists wallets_updated_at
on public.wallets;

create trigger wallets_updated_at
before update on public.wallets
for each row
execute function public.set_updated_at();


drop trigger if exists transactions_updated_at
on public.transactions;

create trigger transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();


-- =========================================================
-- 20. AUTO CREATE PROFILE
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.profiles (
        id,
        name,
        phone,
        role
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'name',
            new.raw_user_meta_data ->> 'full_name'
        ),
        new.raw_user_meta_data ->> 'phone',
        'client'
    )
    on conflict (id) do nothing;

    return new;

end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- =========================================================
-- 21. ENABLE RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.themes enable row level security;
alter table public.packages enable row level security;
alter table public.invitations enable row level security;
alter table public.couples enable row level security;
alter table public.quotes enable row level security;
alter table public.events enable row level security;
alter table public.stories enable row level security;
alter table public.galleries enable row level security;
alter table public.guests enable row level security;
alter table public.rsvp enable row level security;
alter table public.wishes enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;


-- =========================================================
-- 22. HELPER FUNCTION ADMIN
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and role = 'admin'
    );
$$;


-- =========================================================
-- 23. PROFILES POLICIES
-- =========================================================

drop policy if exists "profiles_select_own"
on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
    id = auth.uid()
    or public.is_admin()
);


drop policy if exists "profiles_update_own"
on public.profiles;

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
    id = auth.uid()
)
with check (
    id = auth.uid()
);


drop policy if exists "profiles_admin_all"
on public.profiles;

create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (
    public.is_admin()
)
with check (
    public.is_admin()
);


-- =========================================================
-- 24. THEMES POLICIES
-- =========================================================

drop policy if exists "themes_public_select"
on public.themes;

create policy "themes_public_select"
on public.themes
for select
to anon, authenticated
using (
    is_active = true
    or public.is_admin()
);


drop policy if exists "themes_admin_all"
on public.themes;

create policy "themes_admin_all"
on public.themes
for all
to authenticated
using (
    public.is_admin()
)
with check (
    public.is_admin()
);


-- =========================================================
-- 25. PACKAGES POLICIES
-- =========================================================

drop policy if exists "packages_public_select"
on public.packages;

create policy "packages_public_select"
on public.packages
for select
to anon, authenticated
using (
    is_active = true
    or public.is_admin()
);


drop policy if exists "packages_admin_all"
on public.packages;

create policy "packages_admin_all"
on public.packages
for all
to authenticated
using (
    public.is_admin()
)
with check (
    public.is_admin()
);


-- =========================================================
-- 26. INVITATIONS POLICIES
-- =========================================================

drop policy if exists "invitations_client_select"
on public.invitations;

create policy "invitations_client_select"
on public.invitations
for select
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin()
);


drop policy if exists "invitations_client_insert"
on public.invitations;

create policy "invitations_client_insert"
on public.invitations
for insert
to authenticated
with check (
    user_id = auth.uid()
);


drop policy if exists "invitations_client_update"
on public.invitations;

create policy "invitations_client_update"
on public.invitations
for update
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin()
)
with check (
    user_id = auth.uid()
    or public.is_admin()
);


drop policy if exists "invitations_client_delete"
on public.invitations;

create policy "invitations_client_delete"
on public.invitations
for delete
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin()
);


drop policy if exists "invitations_public_published"
on public.invitations;

create policy "invitations_public_published"
on public.invitations
for select
to anon, authenticated
using (
    status = 'published'
);


-- =========================================================
-- 27. COUPLES POLICIES
-- =========================================================

drop policy if exists "couples_client"
on public.couples;

create policy "couples_client"
on public.couples
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = couples.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = couples.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


drop policy if exists "couples_public"
on public.couples;

create policy "couples_public"
on public.couples
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = couples.invitation_id
        and i.status = 'published'
    )
);


-- =========================================================
-- 28. EVENTS POLICIES
-- =========================================================

drop policy if exists "events_client"
on public.events;

create policy "events_client"
on public.events
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = events.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = events.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


drop policy if exists "events_public"
on public.events;

create policy "events_public"
on public.events
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = events.invitation_id
        and i.status = 'published'
    )
);


-- =========================================================
-- 29. GALLERIES POLICIES
-- =========================================================

drop policy if exists "galleries_client"
on public.galleries;

create policy "galleries_client"
on public.galleries
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = galleries.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = galleries.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


drop policy if exists "galleries_public"
on public.galleries;

create policy "galleries_public"
on public.galleries
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = galleries.invitation_id
        and i.status = 'published'
    )
);


-- =========================================================
-- 30. STORIES POLICIES
-- =========================================================

drop policy if exists "stories_client"
on public.stories;

create policy "stories_client"
on public.stories
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = stories.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = stories.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


drop policy if exists "stories_public"
on public.stories;

create policy "stories_public"
on public.stories
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = stories.invitation_id
        and i.status = 'published'
    )
);


-- =========================================================
-- 31. QUOTES POLICIES
-- =========================================================

drop policy if exists "quotes_client"
on public.quotes;

create policy "quotes_client"
on public.quotes
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = quotes.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = quotes.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


drop policy if exists "quotes_public"
on public.quotes;

create policy "quotes_public"
on public.quotes
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = quotes.invitation_id
        and i.status = 'published'
    )
);


-- =========================================================
-- 32. GUESTS POLICIES
-- =========================================================

drop policy if exists "guests_client"
on public.guests;

create policy "guests_client"
on public.guests
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = guests.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = guests.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


-- =========================================================
-- 33. RSVP POLICIES
-- =========================================================

drop policy if exists "rsvp_public_insert"
on public.rsvp;

create policy "rsvp_public_insert"
on public.rsvp
for insert
to anon, authenticated
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = rsvp.invitation_id
        and i.status = 'published'
    )
);


drop policy if exists "rsvp_client_select"
on public.rsvp;

create policy "rsvp_client_select"
on public.rsvp
for select
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = rsvp.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


drop policy if exists "rsvp_client_update"
on public.rsvp;

create policy "rsvp_client_update"
on public.rsvp
for update
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = rsvp.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = rsvp.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


-- =========================================================
-- 34. WISHES POLICIES
-- =========================================================

drop policy if exists "wishes_public_insert"
on public.wishes;

create policy "wishes_public_insert"
on public.wishes
for insert
to anon, authenticated
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = wishes.invitation_id
        and i.status = 'published'
    )
);


drop policy if exists "wishes_public_select"
on public.wishes;

create policy "wishes_public_select"
on public.wishes
for select
to anon, authenticated
using (
    is_visible = true
    and exists (
        select 1
        from public.invitations i
        where i.id = wishes.invitation_id
        and i.status = 'published'
    )
);


drop policy if exists "wishes_client_manage"
on public.wishes;

create policy "wishes_client_manage"
on public.wishes
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = wishes.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = wishes.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


-- =========================================================
-- 35. WALLETS POLICIES
-- =========================================================

drop policy if exists "wallets_client"
on public.wallets;

create policy "wallets_client"
on public.wallets
for all
to authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = wallets.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
)
with check (
    exists (
        select 1
        from public.invitations i
        where i.id = wallets.invitation_id
        and (
            i.user_id = auth.uid()
            or public.is_admin()
        )
    )
);


drop policy if exists "wallets_public"
on public.wallets;

create policy "wallets_public"
on public.wallets
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.invitations i
        where i.id = wallets.invitation_id
        and i.status = 'published'
    )
);


-- =========================================================
-- 36. TRANSACTIONS POLICIES
-- =========================================================

drop policy if exists "transactions_client_select"
on public.transactions;

create policy "transactions_client_select"
on public.transactions
for select
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin()
);


drop policy if exists "transactions_client_insert"
on public.transactions;

create policy "transactions_client_insert"
on public.transactions
for insert
to authenticated
with check (
    user_id = auth.uid()
);


drop policy if exists "transactions_client_update"
on public.transactions;

create policy "transactions_client_update"
on public.transactions
for update
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin()
)
with check (
    user_id = auth.uid()
    or public.is_admin()
);


-- =========================================================
-- 37. ADMIN TRANSACTION MANAGEMENT
-- =========================================================

drop policy if exists "transactions_admin_all"
on public.transactions;

create policy "transactions_admin_all"
on public.transactions
for all
to authenticated
using (
    public.is_admin()
)
with check (
    public.is_admin()
);


-- =========================================================
-- 38. DEFAULT PACKAGES
-- =========================================================

insert into public.packages
(
    name,
    slug,
    description,
    price,
    duration_days,
    features
)
values

(
    'Basic',
    'basic',
    'Paket undangan digital Basic',
    99000,
    30,
    '[
        "1 Tema",
        "Informasi Mempelai",
        "Acara",
        "Google Maps",
        "RSVP",
        "Ucapan",
        "Galeri"
    ]'::jsonb
),

(
    'Premium',
    'premium',
    'Paket undangan digital Premium',
    149000,
    60,
    '[
        "Semua fitur Basic",
        "Love Story",
        "Musik",
        "Unlimited Guest",
        "Custom Guest Name",
        "Galeri"
    ]'::jsonb
),

(
    'Luxury',
    'luxury',
    'Paket undangan digital Luxury',
    249000,
    90,
    '[
        "Semua fitur Premium",
        "Tema Luxury",
        "RSVP Tracking",
        "Guest Management",
        "Custom SEO",
        "Priority Support"
    ]'::jsonb
)

on conflict (slug) do nothing;


-- =========================================================
-- SELESAI
-- =========================================================