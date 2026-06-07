const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export type GoogleOAuthEnv = {
  clientId: string;
  clientSecret: string;
};

export function getGoogleCalendarOAuthEnv(): GoogleOAuthEnv | null {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function buildGoogleCalendarAuthUrl(input: {
  tenantId: string;
  redirectUri: string;
}): string | null {
  const env = getGoogleCalendarOAuthEnv();
  if (!env) return null;

  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: input.tenantId,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const env = getGoogleCalendarOAuthEnv();
  if (!env) {
    throw new Error("Google OAuth yapılandırması eksik.");
  }

  body.set("client_id", env.clientId);
  body.set("client_secret", env.clientSecret);

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as TokenResponse;
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? "Google token isteği başarısız.");
  }

  return data;
}

export async function exchangeGoogleCalendarCode(input: {
  code: string;
  redirectUri: string;
}): Promise<{ accessToken: string; refreshToken: string | null }> {
  const body = new URLSearchParams({
    code: input.code,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
  });

  const data = await postToken(body);
  if (!data.access_token) {
    throw new Error("Google erişim jetonu alınamadı.");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
  };
}

export async function refreshGoogleCalendarAccessToken(
  refreshToken: string
): Promise<string> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const data = await postToken(body);
  if (!data.access_token) {
    throw new Error("Google erişim jetonu yenilenemedi.");
  }

  return data.access_token;
}

export async function fetchGoogleAccountEmail(accessToken: string): Promise<string | null> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { email?: string };
  return typeof data.email === "string" && data.email.trim() ? data.email.trim() : null;
}
