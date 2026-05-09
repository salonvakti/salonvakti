# Güvenlik — Platform kullanıcısı ve RLS

Bu belge, SalonVakti çok kiracılı modelde **platform kullanıcılarının müşteri kişisel verisine (PII) erişememesi** için stratejiyi özetler.

## Uygulama katmanı

- `platform_user` rolü yalnızca `/platform/**` path'lerine middleware ve `canAccessPath()` ile yönlendirilir.
- Tenant yönetimi ekranları yalnızca **aggregate ya da tenant meta** verisini listeler; müşteri adı, telefon, e-posta ya da randevu detayı UI'da sunulmaz.
- `platform_admin` uygulama katmanında yalnızca `/platform/**` panosuna yönlendirilir; işletme veya son müşteri panelleri ayrı oturum (rol) ile açılmalıdır. Destek için ek erişim gerekirse güvenilir backend / service role ile sınırlı araçlar kullanılmalıdır.

## Supabase (önerilen)

1. **JWT / `user_metadata.role`** — Oturum içinde rol ve `tenant_id` taşınır (veya `profiles` tablosu ile `auth.users` eşlenir).
2. **Row Level Security**
   - `platform_user` için `clients`, `appointments` üzerinde doğrudan `SELECT` politikası **tanımlamayın**.
   - Gerekirse anonimleştirilmiş veya toplu metrikler için `SECURITY DEFINER` view / RPC kullanın.
   - `business_admin` / `business_user` politikaları `tenant_id` filtresi ile sınırlı olmalıdır.
3. **Service role** — Yalnızca sunucu tarafı (edge function / güvenilir API) ile kullanılmalıdır; istemciye asla gönderilmez.

## Depolama

Müşteri fotoğrafları / notları için Supabase Storage politikaları, `tenant_id` ve `appointment_id` bağlamı ile RLS seviyesinde kısıtlanmalıdır; `verified_customer` için sadece **kendi kullanıcısı**na ait objeler okunabilir.
