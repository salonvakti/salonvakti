-- Google Takvim entegrasyonu (Pro / Ultimate)
-- Personel ve randevu senkronizasyonu için ek alanlar

alter table public.staff
  add column if not exists google_calendar_email text;

alter table public.appointments
  add column if not exists google_calendar_event_id text;

comment on column public.staff.google_calendar_email is
  'Google Takvim davetleri için personel e-posta adresi (Pro/Ultimate).';

comment on column public.appointments.google_calendar_event_id is
  'Onaylı randevunun Google Calendar etkinlik kimliği.';
