-- Randevu anındaki hizmet fiyatı (TRY); liste fiyatı değişse bile raporlar tarihsel tutarlı kalır.

alter table public.appointments
  add column if not exists price_snapshot numeric(12, 2);

comment on column public.appointments.price_snapshot is 'Rezervasyon oluşturulurken kopyalanan hizmet fiyatı (TRY).';
