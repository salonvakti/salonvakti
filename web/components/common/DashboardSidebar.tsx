"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import type { UserRole } from "@/lib/constants/roles";
import { navItemsForRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

type Props = {
  role: UserRole;
};

export function DashboardSidebar({ role }: Props) {
  const pathname = usePathname();
  const items = navItemsForRole(role);

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Building2 className="h-5 w-5" aria-hidden />
        <span className="text-sm font-semibold">SalonVakti</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/account"
          className={cn(
            "mt-auto rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            (pathname === "/account" || pathname.startsWith("/account/")) &&
              "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          )}
        >
          Hesabım
        </Link>
      </nav>
    </aside>
  );
}
