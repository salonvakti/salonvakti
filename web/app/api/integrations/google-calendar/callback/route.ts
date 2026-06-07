import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import {
  exchangeGoogleCalendarCode,
  fetchGoogleAccountEmail,
} from "@/lib/google/calendar-oauth";
import {
  mergeGoogleCalendarIntoSettingsJson,
  parseGoogleCalendarFromSettingsJson,
} from "@/lib/google/calendar-settings";
import { absoluteUrlFromRequest, getSiteOrigin } from "@/lib/seo/site-url";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = await getRequestOrigin();
  const settingsUrl = new URL("/admin/settings", origin);

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  if (error) {
    settingsUrl.searchParams.set("googleCalendar", "error");
    return NextResponse.redirect(settingsUrl);
  }

  const code = searchParams.get("code");
  const stateTenantId = searchParams.get("state")?.trim();
  if (!code || !stateTenantId) {
    settingsUrl.searchParams.set("googleCalendar", "error");
    return NextResponse.redirect(settingsUrl);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    settingsUrl.searchParams.set("googleCalendar", "error");
    return NextResponse.redirect(settingsUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/admin/settings", origin));
  }

  const profile = getSessionProfile(user);
  if (
    profile?.role !== "business_admin" ||
    !profile.tenantId ||
    profile.tenantId !== stateTenantId
  ) {
    settingsUrl.searchParams.set("googleCalendar", "denied");
    return NextResponse.redirect(settingsUrl);
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    settingsUrl.searchParams.set("googleCalendar", "error");
    return NextResponse.redirect(settingsUrl);
  }

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .select("settings_json")
    .eq("id", profile.tenantId)
    .maybeSingle();

  if (tErr || !tenant) {
    settingsUrl.searchParams.set("googleCalendar", "error");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const redirectUri = await absoluteUrlFromRequest(
      "/api/integrations/google-calendar/callback"
    );
    const tokens = await exchangeGoogleCalendarCode({ code, redirectUri });
    if (!tokens.refreshToken) {
      settingsUrl.searchParams.set("googleCalendar", "no_refresh");
      return NextResponse.redirect(settingsUrl);
    }

    const connectedEmail = await fetchGoogleAccountEmail(tokens.accessToken);
    const previous = parseGoogleCalendarFromSettingsJson(tenant.settings_json);
    const merged = mergeGoogleCalendarIntoSettingsJson(
      tenant.settings_json,
      {
        email: previous?.email ?? connectedEmail ?? "",
        enabled: previous?.enabled ?? true,
        oauth: {
          refreshToken: tokens.refreshToken,
          connectedAt: new Date().toISOString(),
          connectedEmail,
        },
      },
      previous
    );

    const { error: upErr } = await admin
      .from("tenants")
      .update({ settings_json: merged })
      .eq("id", profile.tenantId);

    if (upErr) {
      settingsUrl.searchParams.set("googleCalendar", "error");
      return NextResponse.redirect(settingsUrl);
    }

    settingsUrl.searchParams.set("googleCalendar", "connected");
    return NextResponse.redirect(settingsUrl);
  } catch {
    settingsUrl.searchParams.set("googleCalendar", "error");
    return NextResponse.redirect(settingsUrl);
  }
}

async function getRequestOrigin(): Promise<string> {
  const { getRequestSiteOrigin } = await import("@/lib/seo/site-url");
  const origin = await getRequestSiteOrigin();
  return origin || getSiteOrigin() || "http://localhost:3000";
}
