-- İşletme rolleri (JWT user_metadata.tenant_id) için tenants + services RLS.
-- Platform işlemleri service role ile yapılmaya devam eder.

-- JWT'den işletme kiracısı uuid (business_admin / business_user)
create or replace function public.jwt_business_tenant_id()
returns uuid
language sql
stable
as $$
  select case
    when (auth.jwt() -> 'user_metadata' ->> 'role') in ('business_admin', 'business_user')
    then (nullif(trim(auth.jwt() -> 'user_metadata' ->> 'tenant_id'), ''))::uuid
    else null
  end;
$$;

alter table public.tenants enable row level security;
alter table public.services enable row level security;

drop policy if exists tenants_select_own on public.tenants;
create policy tenants_select_own
  on public.tenants
  for select
  to authenticated
  using (id = public.jwt_business_tenant_id());

drop policy if exists tenants_update_admin on public.tenants;
create policy tenants_update_admin
  on public.tenants
  for update
  to authenticated
  using (
    id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  )
  with check (
    id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  );

drop policy if exists services_select_own on public.services;
create policy services_select_own
  on public.services
  for select
  to authenticated
  using (tenant_id = public.jwt_business_tenant_id());

drop policy if exists services_insert_own on public.services;
create policy services_insert_own
  on public.services
  for insert
  to authenticated
  with check (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  );

drop policy if exists services_update_own on public.services;
create policy services_update_own
  on public.services
  for update
  to authenticated
  using (tenant_id = public.jwt_business_tenant_id())
  with check (tenant_id = public.jwt_business_tenant_id());
