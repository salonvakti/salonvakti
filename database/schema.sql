-- SalonVakti — Supabase uyumlu başlangıç şeması (migration'a bölünebilir)
-- Not: auth.users Supabase tarafından sağlanır; profil eşlemesi genelde `profiles` ile yapılır.

create extension if not exists "pgcrypto";

create type public.tenant_status as enum ('active', 'inactive');

create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'cancelled_by_business',
  'cancelled_by_client',
  'completed'
);

create table public.tenants (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  slug text not null unique,
  logo_url text,
  address text,
  phone text,
  promo_text text,
  status public.tenant_status not null default 'active',
  license_plan text,
  license_start_at timestamptz,
  license_end_at timestamptz,
  settings_json jsonb default '{}'::jsonb,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create table public.services (
  id uuid primary key default gen_random_uuid (),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(12, 2) not null check (price >= 0),
  description text,
  is_active boolean not null default true
);

create index services_tenant_idx on public.services (tenant_id);

create table public.clients (
  id uuid primary key default gen_random_uuid (),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  phone text,
  email text,
  note text,
  business_approved_at timestamptz,
  phone_verified_at timestamptz,
  invite_token text unique,
  invite_expires_at timestamptz,
  created_at timestamptz not null default now ()
);

create index clients_tenant_idx on public.clients (tenant_id);

create table public.staff (
  id uuid primary key default gen_random_uuid (),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null,
  team_role text,
  color text
);

create index staff_tenant_idx on public.staff (tenant_id);

-- Personel RLS (migration: 008_staff_rls.sql)

create table public.appointments (
  id uuid primary key default gen_random_uuid (),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  staff_id uuid references public.staff (id) on delete set null,
  service_id uuid not null references public.services (id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.appointment_status not null default 'pending',
  created_at timestamptz not null default now (),
  check (end_time > start_time)
);

create index appointments_tenant_window_idx on public.appointments (tenant_id, start_time);

-- Platform öne çıkan işletmeler + müşteri daveti (migration: 007_platform_featured_client_invite.sql)
create table public.platform_featured_tenants (
  tenant_id uuid not null primary key references public.tenants (id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now ()
);

-- Ana sayfa paket fiyat metinleri (migration: 004_landing_package_prices.sql)
create table public.landing_package_prices (
  slug text primary key check (slug in ('basic', 'pro', 'ultimate')),
  price_label text not null default '—',
  updated_at timestamptz not null default now ()
);

-- İşletme panosu tenants/services RLS: migration 005_business_tenant_rls.sql dosyasını Supabase’te çalıştırın.

-- Örnek: Diğer tablolar için RLS SECURITY.md ile birlikte uygulanmalıdır.
