import type { SupabaseClient } from "@supabase/supabase-js";
import { hasBooleanFeature, loadTenantFeaturesById } from "@/lib/features";
import {
  parseGoogleCalendarFromSettingsJson,
  type GoogleCalendarTenantConfig,
} from "@/lib/google/calendar-settings";
import {
  refreshGoogleCalendarAccessToken,
} from "@/lib/google/calendar-oauth";

type AppointmentSyncRow = {
  id: string;
  tenant_id: string;
  staff_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
  google_calendar_event_id: string | null;
  clients: { name?: string } | null;
  services: { name?: string } | null;
  staff: { display_name?: string; google_calendar_email?: string | null } | null;
  tenant_branches: { name?: string } | null;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function uniqueEmails(emails: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of emails) {
    const email = raw?.trim().toLowerCase();
    if (!email || !isValidEmail(email) || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

function buildEventDescription(row: AppointmentSyncRow): string {
  const lines = [
    `Müşteri: ${row.clients?.name ?? "—"}`,
    `Hizmet: ${row.services?.name ?? "—"}`,
    `Personel: ${row.staff?.display_name ?? "—"}`,
  ];
  if (row.tenant_branches?.name) {
    lines.push(`Şube: ${row.tenant_branches.name}`);
  }
  return lines.join("\n");
}

async function createGoogleCalendarEvent(input: {
  accessToken: string;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}): Promise<string> {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: {
          dateTime: input.startTime,
          timeZone: "Europe/Istanbul",
        },
        end: {
          dateTime: input.endTime,
          timeZone: "Europe/Istanbul",
        },
        attendees: input.attendees.map((email) => ({ email })),
      }),
    }
  );

  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message ?? "Google Calendar etkinliği oluşturulamadı.");
  }

  return data.id;
}

function isSyncReady(config: GoogleCalendarTenantConfig | null): config is GoogleCalendarTenantConfig {
  return Boolean(config?.enabled && config.oauth?.refreshToken);
}

/** Onaylanan randevuyu işletme + personel Google Takvim e-postalarına davet olarak ekler. */
export async function syncConfirmedAppointmentToGoogleCalendar(input: {
  admin: SupabaseClient;
  tenantId: string;
  appointmentId: string;
}): Promise<{ ok: boolean; skipped: boolean; error: string | null }> {
  const { features } = await loadTenantFeaturesById(input.admin, input.tenantId);
  if (!hasBooleanFeature(features, "googleCalendarSync")) {
    return { ok: true, skipped: true, error: null };
  }

  const [{ data: tenant }, { data: appointment, error: apErr }] = await Promise.all([
    input.admin
      .from("tenants")
      .select("name,settings_json")
      .eq("id", input.tenantId)
      .maybeSingle(),
    input.admin
      .from("appointments")
      .select(
        "id,tenant_id,staff_id,start_time,end_time,status,google_calendar_event_id,clients(name),services(name),staff(display_name,google_calendar_email),tenant_branches(name)"
      )
      .eq("id", input.appointmentId)
      .eq("tenant_id", input.tenantId)
      .maybeSingle(),
  ]);

  if (apErr || !appointment) {
    return { ok: false, skipped: false, error: apErr?.message ?? "Randevu bulunamadı." };
  }

  const row = appointment as AppointmentSyncRow;
  if (row.status !== "confirmed") {
    return { ok: true, skipped: true, error: null };
  }

  if (row.google_calendar_event_id) {
    return { ok: true, skipped: true, error: null };
  }

  const config = parseGoogleCalendarFromSettingsJson(tenant?.settings_json);
  if (!isSyncReady(config)) {
    return { ok: true, skipped: true, error: null };
  }

  const attendees = uniqueEmails([
    config.email,
    row.staff?.google_calendar_email,
    config.oauth?.connectedEmail,
  ]);

  if (attendees.length === 0) {
    return { ok: true, skipped: true, error: null };
  }

  try {
    const accessToken = await refreshGoogleCalendarAccessToken(config.oauth!.refreshToken);
    const salonName = typeof tenant?.name === "string" ? tenant.name : "Salon";
    const clientName = row.clients?.name ?? "Müşteri";
    const serviceName = row.services?.name ?? "Hizmet";
    const eventId = await createGoogleCalendarEvent({
      accessToken,
      summary: `${salonName} · ${clientName} — ${serviceName}`,
      description: buildEventDescription(row),
      startTime: row.start_time,
      endTime: row.end_time,
      attendees,
    });

    const { error: upErr } = await input.admin
      .from("appointments")
      .update({ google_calendar_event_id: eventId })
      .eq("id", input.appointmentId)
      .eq("tenant_id", input.tenantId);

    if (upErr) {
      return { ok: false, skipped: false, error: upErr.message };
    }

    return { ok: true, skipped: false, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google Takvim senkronizasyonu başarısız.";
    return { ok: false, skipped: false, error: message };
  }
}
