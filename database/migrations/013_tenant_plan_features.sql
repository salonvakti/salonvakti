-- Abonelik paketi (plan_type) ve paket dışı özellik ezmesi (feature_overrides)

alter table public.tenants
  add column if not exists plan_type text not null default 'basic',
  add column if not exists feature_overrides jsonb not null default '{}'::jsonb;

alter table public.tenants
  drop constraint if exists tenants_plan_type_check;

alter table public.tenants
  add constraint tenants_plan_type_check check (
    plan_type in ('basic', 'pro', 'ultimate')
  );

comment on column public.tenants.plan_type is 'Abonelik paketi: basic | pro | ultimate';
comment on column public.tenants.feature_overrides is 'Paket varsayılanlarını ezen tekil modül/limit JSON (örn. {"maxBranches": 5, "whatsappIntegration": true})';

-- Mevcut license_plan etiketinden plan_type doldur (geçerli değerler)
update public.tenants
set
  plan_type = lower(trim(license_plan))
where
  license_plan is not null
  and lower(trim(license_plan)) in ('basic', 'pro', 'ultimate')
  and plan_type = 'basic';
