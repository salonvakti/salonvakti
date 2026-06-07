import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { hasBooleanFeature, loadTenantFeaturesById } from "@/lib/features";
import { buildGoogleCalendarAuthUrl } from "@/lib/google/calendar-oauth";
import { absoluteUrlFromRequest, getSiteOrigin } from "@/lib/seo/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Oturum yapılandırması eksik." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/admin/settings", await getRequestOrigin()));
  }

  const profile = getSessionProfile(user);
  if (profile?.role !== "business_admin" || !profile.tenantId) {
    return NextResponse.redirect(
      new URL("/admin/settings?googleCalendar=denied", await getRequestOrigin())
    );
  }

  const { features } = await loadTenantFeaturesById(supabase, profile.tenantId);
  if (!hasBooleanFeature(features, "googleCalendarSync")) {
    return NextResponse.redirect(
      new URL("/admin/settings?googleCalendar=package", await getRequestOrigin())
    );
  }

  const redirectUri = await absoluteUrlFromRequest(
    "/api/integrations/google-calendar/callback"
  );
  const authUrl = buildGoogleCalendarAuthUrl({
    tenantId: profile.tenantId,
    redirectUri,
  });

  if (!authUrl) {
    return NextResponse.redirect(
      new URL("/admin/settings?googleCalendar=config", await getRequestOrigin())
    );
  }

  return NextResponse.redirect(authUrl);
}

async function getRequestOrigin(): Promise<string> {
  const { getRequestSiteOrigin } = await import("@/lib/seo/site-url");
  const origin = await getRequestSiteOrigin();
  return origin || getSiteOrigin() || "http://localhost:3000";
}
