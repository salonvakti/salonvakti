# Veritabanı Özeti — SalonVakti

Supabase PostgreSQL için başlangıç şeması [database/schema.sql](database/schema.sql) dosyasında verilmiştir. Uygulama tipleri için bkz. `web/lib/db-types.ts`.

## Çekirdek tablolar

| Tablo          | Açıklama                                              |
|----------------|--------------------------------------------------------|
| tenants        | Çok kiracılı işletme (slug, logo, durum)              |
| services       | Süre (dk) ve ücret içeren hizmet kartları             |
| staff          | Personel ve takvim renkleri                           |
| clients        | İşletme müşteri kartı (isteğe bağlı `user_id` bağlar) |
| appointments   | Randevu satırları, `pending` bekleyen işletme onayı   |

## Durumlar

- `appointments.status`: `pending` → `confirmed` | `cancelled_by_business` | `cancelled_by_client` → `completed`.

## RLS

Üretim ortamında mutlaka RLS açık tutulmalı; ayrıntılar için [SECURITY.md](./SECURITY.md).
