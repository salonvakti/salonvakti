import type { AppointmentSummary } from "@/types/appointment";
import type { ServiceSummary } from "@/types/service";

export const demoServices: ServiceSummary[] = [
  {
    id: "svc-1",
    name: "Saç kesimi",
    durationMinutes: 45,
    price: 450,
    description: "Yıkama dahil",
  },
  {
    id: "svc-2",
    name: "Fön",
    durationMinutes: 30,
    price: 300,
    description: null,
  },
  {
    id: "svc-3",
    name: "Boyama",
    durationMinutes: 120,
    price: 1800,
    description: "Ürün farkı uygulanabilir",
  },
];

export const demoAppointments: AppointmentSummary[] = [
  {
    id: "ap-1",
    tenantId: "demo-tenant",
    clientName: "Ayşe Yılmaz",
    serviceName: "Saç kesimi",
    staffName: "Zeynep",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 45 * 60_000).toISOString(),
    status: "pending",
  },
  {
    id: "ap-2",
    tenantId: "demo-tenant",
    clientName: "Mehmet Kaya",
    serviceName: "Boyama",
    staffName: "Ali",
    startTime: new Date(Date.now() + 3 * 60 * 60_000).toISOString(),
    endTime: new Date(Date.now() + 5 * 60 * 60_000).toISOString(),
    status: "confirmed",
  },
];
