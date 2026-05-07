/** İşletme (tenant) – domain modeli */

export interface SalonSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
}
