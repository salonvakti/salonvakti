/**
 * SalonVakti – veritabanı satırları için TypeScript tipleri (Supabase ile uyumlu).
 */

import type { UserRole } from "@/lib/constants/roles";

export type TenantStatus = "active" | "inactive";

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  status: TenantStatus;
  /** Lisans paket etiketi (örn. basic, pro) */
  license_plan: string | null;
  /** Lisans geçerlilik başlangıcı; null = başlangıç kısıtı yok */
  license_start_at: string | null;
  /** Lisans bitişi; geçmiş tarih = panel erişimi kapalı */
  license_end_at: string | null;
  settings_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled_by_business"
  | "cancelled_by_client"
  | "completed";

export interface AppointmentRow {
  id: string;
  tenant_id: string;
  client_id: string;
  staff_id: string | null;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface ClientRow {
  id: string;
  tenant_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  /** İşletme onayı verildiyse dolu */
  business_approved_at: string | null;
  /** Telefon doğrulandıysa dolu */
  phone_verified_at: string | null;
  created_at: string;
}

export interface ServiceRow {
  id: string;
  tenant_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
  is_active: boolean;
}

export interface StaffRow {
  id: string;
  tenant_id: string;
  user_id: string | null;
  display_name: string;
  /** İşletme içi görünüm rolü (Supabase Auth rolünden bağımsız etiket) */
  team_role: string | null;
  color: string | null;
}

/** Ana sayfa Basic / Pro / Ultimate fiyat satırı */
export interface LandingPackagePriceRow {
  slug: "basic" | "pro" | "ultimate";
  price_label: string;
  updated_at: string;
}

export interface UserProfileRow {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  tenant_id: string | null;
  avatar_url: string | null;
}
