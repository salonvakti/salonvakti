-- Tanıtım sayfası için kıseo uyumlu tanıtım metni (işletme panelinden düzenlenir).

alter table public.tenants add column if not exists promo_text text;

comment on column public.tenants.promo_text is 'Genel /isletme/{slug} tanıtım sayfasında gösterilen kısa metin.';
