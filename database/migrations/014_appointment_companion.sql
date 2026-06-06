-- Kayıtlı müşteri randevularında yan misafir (çocuk / evcil hayvan / arkadaş)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_companion_type') then
    create type public.appointment_companion_type as enum ('child', 'pet', 'friend');
  end if;
end
$$;

alter table public.appointments
  add column if not exists companion_type public.appointment_companion_type null;

comment on column public.appointments.companion_type is
  'Kayıtlı müşterinin randevuya eşlik eden misafiri: child=çocuk, pet=evcil hayvan, friend=arkadaş.';
