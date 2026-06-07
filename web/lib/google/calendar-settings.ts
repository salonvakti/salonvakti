import { hasBooleanFeature } from "@/lib/features";
import type { ResolvedTenantFeatures } from "@/types/features";

export type GoogleCalendarOAuthConfig = {
  refreshToken: string;
  connectedAt: string;
  connectedEmail: string | null;
};

export type GoogleCalendarTenantConfig = {
  email: string;
  enabled: boolean;
  oauth: GoogleCalendarOAuthConfig | null;
};

export type GoogleCalendarTenantConfigPublic = {
  email: string;
  enabled: boolean;
  oauthConnected: boolean;
  connectedEmail: string | null;
  connectedAt: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function hasGoogleCalendarPackage(features: ResolvedTenantFeatures): boolean {
  return hasBooleanFeature(features, "googleCalendarSync");
}

export function parseGoogleCalendarFromSettingsJson(
  settingsJson: unknown
): GoogleCalendarTenantConfig | null {
  if (!isRecord(settingsJson)) return null;
  const raw = settingsJson.googleCalendar;
  if (!isRecord(raw)) return null;

  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const enabled = raw.enabled !== false;

  let oauth: GoogleCalendarOAuthConfig | null = null;
  const oauthRaw = raw.oauth;
  if (isRecord(oauthRaw)) {
    const refreshToken =
      typeof oauthRaw.refreshToken === "string" ? oauthRaw.refreshToken.trim() : "";
    const connectedAt =
      typeof oauthRaw.connectedAt === "string" ? oauthRaw.connectedAt.trim() : "";
    if (refreshToken && connectedAt) {
      oauth = {
        refreshToken,
        connectedAt,
        connectedEmail:
          typeof oauthRaw.connectedEmail === "string" && oauthRaw.connectedEmail.trim()
            ? oauthRaw.connectedEmail.trim()
            : null,
      };
    }
  }

  if (!email && !oauth) return null;

  return { email, enabled, oauth };
}

export function toPublicGoogleCalendarConfig(
  config: GoogleCalendarTenantConfig | null
): GoogleCalendarTenantConfigPublic {
  if (!config) {
    return {
      email: "",
      enabled: false,
      oauthConnected: false,
      connectedEmail: null,
      connectedAt: null,
    };
  }

  return {
    email: config.email,
    enabled: config.enabled,
    oauthConnected: Boolean(config.oauth?.refreshToken),
    connectedEmail: config.oauth?.connectedEmail ?? null,
    connectedAt: config.oauth?.connectedAt ?? null,
  };
}

export function mergeGoogleCalendarIntoSettingsJson(
  existing: unknown,
  input: {
    email: string;
    enabled: boolean;
    oauth?: GoogleCalendarOAuthConfig | null;
  },
  previous: GoogleCalendarTenantConfig | null
): Record<string, unknown> {
  const base = isRecord(existing) ? { ...existing } : {};
  const oauth =
    input.oauth === undefined ? (previous?.oauth ?? null) : input.oauth;

  base.googleCalendar = {
    email: input.email.trim(),
    enabled: input.enabled,
    oauth: oauth
      ? {
          refreshToken: oauth.refreshToken,
          connectedAt: oauth.connectedAt,
          connectedEmail: oauth.connectedEmail,
        }
      : null,
  };

  return base;
}
