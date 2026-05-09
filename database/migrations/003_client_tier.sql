-- Müşteri durumları: işletme onayı, telefon onayı (admin/clients renk kodları)
alter table public.clients
  add column if not exists business_approved_at timestamptz,
  add column if not exists phone_verified_at timestamptz;

comment on column public.clients.business_approved_at is 'İşletme tarafından onaylandıysa dolu (yeşil)';
comment on column public.clients.phone_verified_at is 'Telefon doğrulandıysa dolu (sarı; işletme onayı yoksa)';
