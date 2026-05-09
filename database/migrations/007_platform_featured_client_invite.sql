-- Platform: öne çıkan işletmeler (herkese açık /isletmeler sıralaması)
-- clients: e-posta/hesap daveti (token)

create table public.platform_featured_tenants (
  tenant_id uuid not null primary key references public.tenants (id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now ()
);

create index platform_featured_tenants_sort_idx on public.platform_featured_tenants (sort_order);

comment on table public.platform_featured_tenants is 'Platform yönetimi: /isletmeler ve vitrinde üstte gösterilecek işletmeler.';

alter table public.clients
  add column if not exists invite_token text unique;

alter table public.clients
  add column if not exists invite_expires_at timestamptz;

comment on column public.clients.invite_token is 'Hesap bağlama daveti; tek kullanımlık URL parçası.';
comment on column public.clients.invite_expires_at is 'Davetin geçerlilik bitişi.';
