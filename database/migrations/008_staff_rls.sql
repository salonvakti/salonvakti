-- Personel tablosu: işletme kiracısı için SELECT/INSERT/UPDATE/DELETE RLS.
-- jwt_business_tenant_id() migration 005 ile tanımlı olmalıdır.

alter table public.staff enable row level security;

drop policy if exists staff_select_business on public.staff;
create policy staff_select_business
  on public.staff
  for select
  to authenticated
  using (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') in ('business_admin', 'business_user')
  );

drop policy if exists staff_insert_business_admin on public.staff;
create policy staff_insert_business_admin
  on public.staff
  for insert
  to authenticated
  with check (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  );

drop policy if exists staff_update_business_admin on public.staff;
create policy staff_update_business_admin
  on public.staff
  for update
  to authenticated
  using (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  )
  with check (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  );

drop policy if exists staff_delete_business_admin on public.staff;
create policy staff_delete_business_admin
  on public.staff
  for delete
  to authenticated
  using (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  );
