/** Hizmet – domain modeli */

export interface ServiceSummary {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
}
