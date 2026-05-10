-- Herkese açık vitrin: tema renkleri, metin ve görsel URL’leri (platform yönetimi).
-- Okuma: anon SELECT. Yazma: yalnızca service role (sunucu aksiyonları).

create table public.platform_public_site_settings (
  id text primary key default 'default' check (id = 'default'),
  settings_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now ()
);

insert into public.platform_public_site_settings (id, settings_json)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.platform_public_site_settings enable row level security;

drop policy if exists platform_public_site_settings_select_anon on public.platform_public_site_settings;

create policy platform_public_site_settings_select_anon on public.platform_public_site_settings for
select to anon, authenticated using (true);
