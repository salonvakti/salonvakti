"use server";

import { revalidatePath } from "next/cache";
import { fetchReviewsFromGoogleMapsInput } from "@/lib/google/places-reviews";
import { getSessionProfile } from "@/lib/auth/session";
import { mergePublicSiteSettings } from "@/lib/platform/public-site-settings";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_URL = 2048;
const MAX_PLACE_ID = 256;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function cleanGoogleMapsUrl(v: string): string | null {
  const s = v.trim().slice(0, MAX_URL);
  if (!s) return null;
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    const host = u.hostname.toLowerCase();
    const ok =
      host.includes("google.") ||
      host.includes("goo.gl") ||
      host === "maps.app.goo.gl";
    if (!ok) return null;
    return u.toString();
  } catch {
    return null;
  }
}

type AdminGate =
  | { ok: true; admin: NonNullable<ReturnType<typeof createServiceRoleSupabaseClient>> }
  | { ok: false; error: string };

async function requirePlatformAdmin(): Promise<AdminGate> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Oturum yapılandırması eksik." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || getSessionProfile(user)?.role !== "platform_admin") {
    return { ok: false, error: "Bu işlem için platform yöneticisi gerekli." };
  }
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };
  return { ok: true, admin };
}

export async function getGoogleReviewsSettingsAction(): Promise<{
  settings: ReturnType<typeof mergePublicSiteSettings>;
  error: string | null;
}> {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) {
    return { settings: mergePublicSiteSettings({}), error: gate.error };
  }

  const { data, error } = await gate.admin
    .from("platform_public_site_settings")
    .select("settings_json")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return { settings: mergePublicSiteSettings({}), error: error.message };
  }

  return {
    settings: mergePublicSiteSettings((data as { settings_json: unknown } | null)?.settings_json),
    error: null,
  };
}

export async function saveGoogleMapsReviewsAction(input: {
  googleMapsUrl: string;
  googleMapsPlaceId: string;
  refreshReviews: boolean;
}): Promise<{ ok: boolean; error: string | null; reviewCount: number }> {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) {
    return { ok: false, error: gate.error, reviewCount: 0 };
  }

  const mapsUrl = cleanGoogleMapsUrl(input.googleMapsUrl);
  const placeIdField = input.googleMapsPlaceId.trim().slice(0, MAX_PLACE_ID) || null;

  if (!mapsUrl && !placeIdField) {
    return { ok: false, error: "Google Haritalar bağlantısı veya Place ID girin.", reviewCount: 0 };
  }

  const { data: row } = await gate.admin
    .from("platform_public_site_settings")
    .select("settings_json")
    .eq("id", "default")
    .maybeSingle();

  const prev = isRecord(row?.settings_json) ? row!.settings_json : {};
  const prevIntegrations = isRecord(prev.integrations) ? { ...prev.integrations } : {};

  let reviews = Array.isArray(prevIntegrations.googleMapsReviews)
    ? prevIntegrations.googleMapsReviews
    : [];
  let rating: number | null =
    typeof prevIntegrations.googleMapsRating === "number"
      ? prevIntegrations.googleMapsRating
      : null;
  let reviewCount: number | null =
    typeof prevIntegrations.googleMapsReviewCount === "number"
      ? prevIntegrations.googleMapsReviewCount
      : null;
  let fetchedAt: string | null =
    typeof prevIntegrations.googleMapsReviewsFetchedAt === "string"
      ? prevIntegrations.googleMapsReviewsFetchedAt
      : null;
  let resolvedPlaceId =
    typeof prevIntegrations.googleMapsPlaceId === "string"
      ? prevIntegrations.googleMapsPlaceId
      : null;

  if (input.refreshReviews && (mapsUrl || placeIdField)) {
    try {
      const result = await fetchReviewsFromGoogleMapsInput(
        mapsUrl ?? `https://www.google.com/maps/place/?q=place_id:${placeIdField}`,
        placeIdField
      );
      reviews = result.reviews;
      rating = result.rating;
      reviewCount = result.reviewCount;
      resolvedPlaceId = result.placeId;
      fetchedAt = new Date().toISOString();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Yorumlar alınamadı.";
      return { ok: false, error: msg, reviewCount: 0 };
    }
  }

  const integrations: Record<string, unknown> = {
    ...prevIntegrations,
    googleMapsUrl: mapsUrl,
    googleMapsPlaceId: placeIdField ?? resolvedPlaceId,
    googleMapsRating: rating,
    googleMapsReviewCount: reviewCount,
    googleMapsReviews: reviews,
    googleMapsReviewsFetchedAt: fetchedAt,
  };

  const settings_json: Record<string, unknown> = {
    ...prev,
    integrations,
  };

  const { error } = await gate.admin.from("platform_public_site_settings").upsert(
    {
      id: "default",
      settings_json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, error: error.message, reviewCount: 0 };
  }

  revalidatePath("/");
  revalidatePath("/platform/google-reviews");
  return { ok: true, error: null, reviewCount: reviews.length };
}
