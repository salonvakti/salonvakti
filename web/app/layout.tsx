import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { PublicSiteProvider } from "@/components/providers/public-site-provider";
import { getPublicSiteSettings, themeToCssVars } from "@/lib/platform/public-site-settings";
import { cn } from "@/lib/utils";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getPublicSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const meta: Metadata = {
    metadataBase: new URL(baseUrl),
    title: `${s.copy.siteName} – Online randevu ve salon yönetimi`,
    description: s.copy.metaDescription,
  };
  if (s.images.ogImageUrl) {
    meta.openGraph = {
      title: `${s.copy.siteName} – Online randevu ve salon yönetimi`,
      description: s.copy.metaDescription,
      locale: "tr_TR",
      type: "website",
      url: baseUrl,
      siteName: s.copy.siteName,
      images: [{ url: s.images.ogImageUrl }],
    };
  }
  return meta;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSiteSettings();
  const vars = themeToCssVars(settings.theme);
  const bodyStyle = vars as CSSProperties;

  return (
    <html lang="tr" suppressHydrationWarning className={cn(inter.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased" style={bodyStyle}>
        <PublicSiteProvider value={settings}>
          <SupabaseProvider>{children}</SupabaseProvider>
        </PublicSiteProvider>
      </body>
    </html>
  );
}
