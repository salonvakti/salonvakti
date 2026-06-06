-- Müşteri global profili (sağlık / onay) ve favori salonlar

create table public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  birth_date date,
  allergen_status text,
  regular_medications text,
  chronic_condition_pregnancy text,
  skin_hair_type text,
  kvkk_consent_at timestamptz,
  commercial_consent_at timestamptz,
  service_risk_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_favorite_tenants (
  user_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create index customer_favorite_tenants_user_idx on public.customer_favorite_tenants (user_id);

alter table public.customer_profiles enable row level security;
alter table public.customer_favorite_tenants enable row level security;

drop policy if exists customer_profiles_self on public.customer_profiles;
create policy customer_profiles_self
  on public.customer_profiles
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists customer_favorites_self on public.customer_favorite_tenants;
create policy customer_favorites_self
  on public.customer_favorite_tenants
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
