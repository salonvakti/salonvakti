-- İşletme SMS gönderim kayıtları (Netgsm)

create table public.tenant_sms_messages (
  id uuid primary key default gen_random_uuid (),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  recipient_phone text not null,
  message text not null,
  status text not null check (status in ('sent', 'failed')),
  netgsm_job_id text,
  netgsm_code text,
  netgsm_description text,
  sent_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now ()
);

create index tenant_sms_messages_tenant_created_idx on public.tenant_sms_messages (tenant_id, created_at desc);

alter table public.tenant_sms_messages enable row level security;

drop policy if exists tenant_sms_messages_select_business on public.tenant_sms_messages;
create policy tenant_sms_messages_select_business
  on public.tenant_sms_messages
  for select
  to authenticated
  using (
    tenant_id = public.jwt_business_tenant_id()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'business_admin'
  );
