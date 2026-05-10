import "server-only";

import type { TenantRow } from "@/lib/db-types";
import { fetchPublicBookingStaff } from "@/lib/public/booking-staff";
import { pickPublicAddress, pickPublicPromo } from "@/lib/public/tenant-public-fields";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isTenantLicenseActive } from "@/lib/tenant/license";
import { normalizeTenantSlug } from "@/lib/tenant/slug";

export type PublicSalonService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
};

export type PublicSalonBranch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
};

export type PublicSalonStaff = {
  id: string;
  displayName: string;
  branchId: string | null;
};

export type PublicSalonDetail = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  promoText: string | null;
  /** Aktif şubeler; boşsa tek lokasyon (şube seçimi yok) */
  branches: PublicSalonBranch[];
  services: PublicSalonService[];
  staff: PublicSalonStaff[];
};

export type PublicSalonListItem = Pick<
  PublicSalonDetail,
  "id" | "name" | "slug" | "address" | "phone" | "logoUrl" | "promoText"
> & { isFeatured: boolean };

function tenantRowEligible(t: Pick<TenantRow, "status" | "license_start_at" | "license_end_at">): boolean {
  if (t.status !== "active") return false;
  return isTenantLicenseActive({
    license_start_at: t.license_start_at,
    license_end_at: t.license_end_at,
  });
}

/** Aktif lisanslı işletmeler — yalnızca sunucu bileşenleri (service role). */
export async function listPublicSalons(): Promise<{
  salons: PublicSalonListItem[];
  error: string | null;
}> {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { salons: [], error: null };
  }

  const { data, error } = await admin
    .from("tenants")
    .select(
      "id,name,slug,logo_url,address,phone,promo_text,settings_json,status,license_start_at,license_end_at"
    )
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    return { salons: [], error: error.message };
  }

  const rows = (data ?? []) as Pick<
    TenantRow,
    | "id"
    | "name"
    | "slug"
    | "logo_url"
    | "address"
    | "phone"
    | "promo_text"
    | "status"
    | "license_start_at"
    | "license_end_at"
  >[];

  const base: PublicSalonListItem[] = rows
    .filter((t) => tenantRowEligible(t))
    .map((t) => {
      const raw = t as unknown as Record<string, unknown>;
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        logoUrl: t.logo_url,
        address: pickPublicAddress(raw),
        phone: t.phone,
        promoText: pickPublicPromo(raw),
        isFeatured: false,
      };
    });

  const { data: featRows, error: fErr } = await admin
    .from("platform_featured_tenants")
    .select("tenant_id, sort_order")
    .order("sort_order", { ascending: true });

  if (fErr) {
    return {
      salons: base.sort((a, b) => a.name.localeCompare(b.name, "tr")).map((s) => ({
        ...s,
        isFeatured: false,
      })),
      error: null,
    };
  }

  const featuredOrder = (featRows ?? []) as { tenant_id: string; sort_order: number }[];
  const featuredIdSet = new Set(featuredOrder.map((r) => r.tenant_id));

  const featuredSalons: PublicSalonListItem[] = [];
  for (const row of featuredOrder) {
    const s = base.find((x) => x.id === row.tenant_id);
    if (s) {
      featuredSalons.push({ ...s, isFeatured: true });
    }
  }

  const rest = base
    .filter((s) => !featuredIdSet.has(s.id))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
    .map((s) => ({ ...s, isFeatured: false }));

  return { salons: [...featuredSalons, ...rest], error: null };
}

export async function getPublicSalonBySlug(rawSlug: string): Promise<{
  salon: PublicSalonDetail | null;
  error: string | null;
}> {
  const slug = normalizeTenantSlug(rawSlug);
  if (!slug) {
    return { salon: null, error: null };
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return { salon: null, error: null };
  }

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .select(
      "id,name,slug,logo_url,address,phone,promo_text,settings_json,status,license_start_at,license_end_at"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (tErr) {
    return { salon: null, error: tErr.message };
  }

  const tr = tenant as TenantRow | null;
  if (!tr || !tenantRowEligible(tr)) {
    return { salon: null, error: null };
  }

  const rawTenant = tenant as unknown as Record<string, unknown>;
  const resolvedPromo = pickPublicPromo(rawTenant);
  const resolvedAddress = pickPublicAddress(rawTenant);

  const { data: svcRows, error: sErr } = await admin
    .from("services")
    .select("id,name,duration_minutes,price,description")
    .eq("tenant_id", tr.id)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (sErr) {
    return { salon: null, error: sErr.message };
  }

  const services: PublicSalonService[] = (svcRows ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
    durationMinutes: s.duration_minutes as number,
    price: Number(s.price ?? 0),
    description: (s.description as string | null) ?? null,
  }));

  const { data: branchRows, error: bErr } = await admin
    .from("tenant_branches")
    .select("id,name,address,phone,sort_order")
    .eq("tenant_id", tr.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (bErr) {
    return { salon: null, error: bErr.message };
  }

  const branches: PublicSalonBranch[] = (branchRows ?? []).map((b) => ({
    id: b.id as string,
    name: b.name as string,
    address: (b.address as string | null) ?? null,
    phone: (b.phone as string | null) ?? null,
  }));

  const staffRaw = await fetchPublicBookingStaff(tr.id);
  const staff: PublicSalonStaff[] = staffRaw.map((s) => ({
    id: s.id,
    displayName: s.displayName,
    branchId: s.branchId,
  }));

  return {
    salon: {
      id: tr.id,
      name: tr.name,
      slug: tr.slug,
      logoUrl: tr.logo_url,
      address: resolvedAddress,
      phone: tr.phone,
      promoText: resolvedPromo,
      branches,
      services,
      staff,
    },
    error: null,
  };
}
