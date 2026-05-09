import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { canAccessPath, getDefaultDashboardPath } from "@/lib/auth/permissions";
import { getSessionProfile } from "@/lib/auth/session";

function isProtectedDashboardPath(pathname: string): boolean {
  const prefixes = ["/admin", "/staff", "/platform", "/client", "/account"];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({ request });

  if (!url || !key) {
    if (isProtectedDashboardPath(pathname)) {
      const dest =
        pathname === "/client" || pathname.startsWith("/client/")
          ? "/customer/login?error=config"
          : "/login?error=config";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedDashboardPath(pathname)) {
    if (!user) {
      const loginUrl = new URL(
        pathname === "/client" || pathname.startsWith("/client/") ? "/customer/login" : "/login",
        request.url
      );
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const profile = getSessionProfile(user);
    const isAccountPath = pathname === "/account" || pathname.startsWith("/account/");
    if (!isAccountPath && profile && !canAccessPath(pathname, profile.role)) {
      const fallback = getDefaultDashboardPath(profile.role);
      return NextResponse.redirect(new URL(fallback, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
