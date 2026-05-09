-- İşletme süre bazlı lisans alanları (mevcut projeler için ALTER)
alter table public.tenants
  add column if not exists license_plan text,
  add column if not exists license_start_at timestamptz,
  add column if not exists license_end_at timestamptz;

comment on column public.tenants.license_plan is 'Örn. basic, pro — etiket amaçlı';
comment on column public.tenants.license_start_at is 'Lisansın geçerli sayılacağı başlangıç (null = kısıt yok)';
comment on column public.tenants.license_end_at is 'Lisans bitişi; geçmişse işletme paneli kapatılır (null = bitiş kısıtı yok)';
