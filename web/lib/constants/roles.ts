/**
 * SalonVakti – platform ve tenant rolleri.
 * Supabase Auth `user_metadata.role` veya custom JWT claim ile eşleştirilmelidir.
 */
export const USER_ROLES = [
  "platform_admin",
  "platform_user",
  "business_admin",
  "business_user",
  "customer",
  "verified_customer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  platform_admin: "Platform yöneticisi",
  platform_user: "Platform kullanıcısı",
  business_admin: "İşletme yöneticisi",
  business_user: "İşletme personeli",
  customer: "Müşteri",
  verified_customer: "Onaylı müşteri",
};

/** Platform user kesinlikle müşteri PII içeren ekranları kullanamaz. */
export function isPlatformStaffRole(role: UserRole): boolean {
  return role === "platform_admin" || role === "platform_user";
}

/** İşletme paneli rolleri */
export function isBusinessRole(role: UserRole): boolean {
  return role === "business_admin" || role === "business_user";
}

export function isCustomerRole(role: UserRole): boolean {
  return role === "customer" || role === "verified_customer";
}
