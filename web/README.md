# SalonVakti (web)

Next.js 14 + Tailwind + shadcn/ui + Supabase Auth iskeleti. Detaylı SaaS planı ve rol modeli `docs/` klasöründedir.

## Kurulum

```bash
cd web
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm install
npm run dev
```

Supabase projenizde kullanıcı oluştururken `user_metadata` içine şu alanları koyun:

- `role`: `platform_admin` | `platform_user` | `business_admin` | `business_user` | `customer` | `verified_customer`
- `tenant_id`: (işletme rolleri için UUID)

## Klasör yapısı

- `app/` — App Router rotaları (`(auth)`, `(dashboard)`, `booking/[salonSlug]`).
- `components/` — Ortak, auth, booking, dashboard bileşenleri.
- `lib/auth` — Roller, izin matrisi (`permissions.ts`), oturum özeti (`session.ts`).
- `lib/supabase` — Tarayıcı ve sunucu istemcileri.
- `middleware.ts` — Oturum yenileme ve rota koruması.

## Kimlik doğrulama

Ortam değişkenleri yoksa middleware herkese açık sayfalara izin verir; pano yolları için `/login?error=config` yönlendirmesi hedeflenmiştir ve `createSupabaseServerClient` `null` ise layout yine config hatasına düşer.

## Yayınlama

Netlify veya Vercel kullanırken `NEXT_PUBLIC_*` anahtarlarını proje ayarlarına ekleyin.
