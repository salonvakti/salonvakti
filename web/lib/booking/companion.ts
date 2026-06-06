export const APPOINTMENT_COMPANION_TYPES = ["child", "pet", "friend"] as const;

export type AppointmentCompanionType = (typeof APPOINTMENT_COMPANION_TYPES)[number];

export const APPOINTMENT_COMPANION_LABELS: Record<AppointmentCompanionType, string> = {
  child: "Çocuk",
  pet: "Evcil hayvan",
  friend: "Arkadaş",
};

export function parseAppointmentCompanionType(
  value: string | null | undefined
): AppointmentCompanionType | null {
  if (!value?.trim()) return null;
  const v = value.trim();
  return APPOINTMENT_COMPANION_TYPES.includes(v as AppointmentCompanionType)
    ? (v as AppointmentCompanionType)
    : null;
}

export function formatCompanionLabel(
  type: AppointmentCompanionType | null | undefined
): string | null {
  if (!type) return null;
  return APPOINTMENT_COMPANION_LABELS[type] ?? null;
}
