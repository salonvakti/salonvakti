/** Müşteri – domain modeli */

export interface ClientSummary {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}
