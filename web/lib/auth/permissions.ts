import type { UserRole } from "@/lib/constants/roles";
import {
  isBusinessRole,
  isCustomerRole,
  isPlatformStaffRole,
} from "@/lib/constants/roles";

export type RoutePrefix =
  | "/admin"
  | "/staff"
  | "/platform"
  | "/client";

/**
 * Pathname (ör. /admin/clients) için rol erişimi.
 * - platform_admin: yalnızca /platform (işletmeler = müşteri; işletme panosu ayrı hesap)
 * - platform_user: yalnızca /platform (müşteri/randevu verisi yok)
 * - business_admin: tam işletme paneli (/admin); personel rotaları (/staff) yalnızca business_user içindir
 * - business_user: personel paneli (/staff) + sınırlı işletme randevu ekranları (/admin/dashboard, /admin/appointments)
 */
export function canAccessPath(pathname: string, role: UserRole): boolean {
  const path = pathname.split("?")[0] ?? pathname;

  if (path === "/account" || path.startsWith("/account/")) {
    return true;
  }

  if (path.startsWith("/platform")) {
    return isPlatformStaffRole(role);
  }

  /** platform_admin ve platform_user yalnızca platform panosu; işletme panelleri ayrı oturumla */
  if (role === "platform_admin" || role === "platform_user") {
    return false;
  }

  if (path.startsWith("/admin")) {
    if (!isBusinessRole(role)) return false;
    if (role === "business_admin") return true;
    if (role === "business_user") {
      return (
        path.startsWith("/admin/dashboard") ||
        path.startsWith("/admin/appointments")
      );
    }
    return false;
  }

  if (path === "/staff" || path.startsWith("/staff/")) {
    return role === "business_user";
  }

  if (path.startsWith("/client")) {
    return isCustomerRole(role);
  }

  return true;
}

export function getDefaultDashboardPath(role: UserRole): string {
  switch (role) {
    case "platform_admin":
    case "platform_user":
      return "/platform/tenants";
    case "business_admin":
      return "/admin/dashboard";
    case "business_user":
      return "/staff/my-schedule";
    case "customer":
    case "verified_customer":
      return "/client/my-bookings";
    default:
      return "/login";
  }
}

/** Sidebar menü öğeleri (href + gerekli roller) */
export const dashboardNav = {
  platform: [
    {
      href: "/platform/tenants",
      label: "İşletmeler",
      roles: ["platform_admin", "platform_user"] as UserRole[],
    },
    {
      href: "/platform/users",
      label: "Platform kullanıcıları",
      roles: ["platform_admin"] as UserRole[],
    },
    {
      href: "/platform/packages",
      label: "Paket fiyatları",
      roles: ["platform_admin"] as UserRole[],
    },
  ],
  businessAdmin: [
    { href: "/admin/dashboard", label: "Özet", roles: ["business_admin"] as UserRole[] },
    {
      href: "/admin/appointments",
      label: "Randevular",
      roles: ["business_admin", "business_user"] as UserRole[],
    },
    { href: "/admin/clients", label: "Müşteriler", roles: ["business_admin"] as UserRole[] },
    { href: "/admin/services", label: "Hizmetler", roles: ["business_admin"] as UserRole[] },
    { href: "/admin/staff", label: "Personel", roles: ["business_admin"] as UserRole[] },
    { href: "/admin/settings", label: "Ayarlar", roles: ["business_admin"] as UserRole[] },
  ],
  staff: [
    {
      href: "/staff/my-schedule",
      label: "Takvimim",
      roles: ["business_user"] as UserRole[],
    },
    {
      href: "/staff/my-clients",
      label: "Müşterilerim",
      roles: ["business_user"] as UserRole[],
    },
  ],
  client: [
    {
      href: "/client/my-bookings",
      label: "Randevularım",
      roles: ["customer", "verified_customer"] as UserRole[],
    },
    {
      href: "/client/my-profile",
      label: "Profilim",
      roles: ["customer", "verified_customer"] as UserRole[],
    },
    {
      href: "/client/favorite-salons",
      label: "Favori salonlar",
      roles: ["customer", "verified_customer"] as UserRole[],
    },
  ],
} as const;

export function navItemsForRole(role: UserRole): { href: string; label: string }[] {
  const items: { href: string; label: string }[] = [];

  if (role === "platform_admin" || role === "platform_user") {
    dashboardNav.platform.forEach((n) => {
      if ((n.roles as readonly UserRole[]).includes(role))
        items.push({ href: n.href, label: n.label });
    });
  }

  if (role === "business_admin") {
    dashboardNav.businessAdmin.forEach((n) => items.push({ href: n.href, label: n.label }));
  }

  if (role === "business_user") {
    dashboardNav.businessAdmin.forEach((n) => {
      if ((n.roles as readonly UserRole[]).includes(role))
        items.push({ href: n.href, label: n.label });
    });
    dashboardNav.staff.forEach((n) => items.push({ href: n.href, label: n.label }));
  }

  if (isCustomerRole(role)) {
    dashboardNav.client.forEach((n) => {
      if ((n.roles as readonly UserRole[]).includes(role))
        items.push({ href: n.href, label: n.label });
    });
  }

  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.href) ? false : (seen.add(i.href), true)));
}
