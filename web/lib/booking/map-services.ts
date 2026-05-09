import type { PublicSalonService } from "@/lib/public/salon-directory";
import type { ServiceSummary } from "@/types/service";

export function mapPublicServicesToSummaries(services: PublicSalonService[]): ServiceSummary[] {
  return services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: s.price,
    description: s.description,
  }));
}
