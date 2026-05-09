import "server-only";

import type { TenantRow } from "@/lib/db-types";
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

export type PublicSalonDetail = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  promoText: string | null;
  services: PublicSalonService[];
};

export type PublicSalonListItem = Pick<
  PublicSalonDetail,
  "id" | "name" | "slug" | "address" | "phone" | "logoUrl" | "promoText"
>;

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
    .select("id,name,slug,logo_url,address,phone,promo_text,status,license_start_at,license_end_at")
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

  const salons: PublicSalonListItem[] = rows
    .filter((t) => tenantRowEligible(t))
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logoUrl: t.logo_url,
      address: t.address,
      phone: t.phone,
      promoText: t.promo_text,
    }));

  return { salons, error: null };
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
      "id,name,slug,logo_url,address,phone,promo_text,status,license_start_at,license_end_at"
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

  return {
    salon: {
      id: tr.id,
      name: tr.name,
      slug: tr.slug,
      logoUrl: tr.logo_url,
      address: tr.address,
      phone: tr.phone,
      promoText: tr.promo_text,
      services,
    },
    error: null,
  };
}
