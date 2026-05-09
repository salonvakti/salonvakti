-- Randevular + müşteriler: işletme paneli (JWT tenant_id) için RLS.
-- Randevu listesinde clients(name) embed için clients SELECT şarttır.
-- jwt_business_tenant_id() migration 005 ile tanımlı olmalıdır.

alter table public.appointments enable row level security;
alter table public.clients enable row level security;

drop policy if exists clients_select_business on public.clients;
create policy clients_select_business
  on public.clients
  for select
  to authenticated
  using (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') in ('business_admin', 'business_user')
  );

drop policy if exists appointments_select_business on public.appointments;
create policy appointments_select_business
  on public.appointments
  for select
  to authenticated
  using (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') in ('business_admin', 'business_user')
  );

drop policy if exists appointments_update_business on public.appointments;
create policy appointments_update_business
  on public.appointments
  for update
  to authenticated
  using (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') in ('business_admin', 'business_user')
  )
  with check (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') in ('business_admin', 'business_user')
  );
