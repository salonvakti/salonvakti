-- İşletme şubeleri: vitrin ve randevu için lokasyon seçimi.
-- jwt_business_tenant_id() migration 005 ile tanımlı olmalıdır.

create table public.tenant_branches (
  id uuid primary key default gen_random_uuid (),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  address text,
  phone text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create index tenant_branches_tenant_idx on public.tenant_branches (tenant_id);

create index tenant_branches_tenant_active_idx on public.tenant_branches (tenant_id)
where
  is_active = true;

alter table public.staff
add column branch_id uuid references public.tenant_branches (id) on delete set null;

create index staff_branch_idx on public.staff (branch_id);

alter table public.appointments
add column branch_id uuid references public.tenant_branches (id) on delete set null;

create index appointments_branch_idx on public.appointments (branch_id);

alter table public.tenant_branches enable row level security;

drop policy if exists tenant_branches_select_business on public.tenant_branches;

create policy tenant_branches_select_business on public.tenant_branches for
select to authenticated using (
  tenant_id = public.jwt_business_tenant_id ()
  and (auth.jwt () -> 'user_metadata' ->> 'role') in ('business_admin', 'business_user')
);

drop policy if exists tenant_branches_insert_admin on public.tenant_branches;

create policy tenant_branches_insert_admin on public.tenant_branches for insert to authenticated
with
  check (
    tenant_id = public.jwt_business_tenant_id ()
    and (auth.jwt () -> 'user_metadata' ->> 'role') = 'business_admin'
  );

drop policy if exists tenant_branches_update_admin on public.tenant_branches;

create policy tenant_branches_update_admin on public.tenant_branches for
update to authenticated using (
  tenant_id = public.jwt_business_tenant_id ()
  and (auth.jwt () -> 'user_metadata' ->> 'role') = 'business_admin'
)
with
  check (
    tenant_id = public.jwt_business_tenant_id ()
    and (auth.jwt () -> 'user_metadata' ->> 'role') = 'business_admin'
  );

drop policy if exists tenant_branches_delete_admin on public.tenant_branches;

create policy tenant_branches_delete_admin on public.tenant_branches for delete to authenticated using (
  tenant_id = public.jwt_business_tenant_id ()
  and (auth.jwt () -> 'user_metadata' ->> 'role') = 'business_admin'
);
