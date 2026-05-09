-- Ana sayfa paket kartlarında gösterilen fiyat metinleri (platform yöneticisi günceller).

create table public.landing_package_prices (
  slug text primary key check (slug in ('basic', 'pro', 'ultimate')),
  price_label text not null default '—',
  updated_at timestamptz not null default now ()
);

comment on table public.landing_package_prices is 'Landing sayfası Basic/Pro/Ultimate fiyat satırları; RLS ile herkese okuma, yazma service role + sunucu eylemi.';

insert into public.landing_package_prices (slug, price_label) values
  ('basic', '10 günlük deneme dahil'),
  ('pro', 'Teklif alın'),
  ('ultimate', 'Teklif alın')
on conflict (slug) do nothing;

alter table public.landing_package_prices enable row level security;

create policy landing_package_prices_select_public
  on public.landing_package_prices
  for select
  using (true);
