import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SalonVakti – Online randevu ve salon yönetimi",
  description:
    "Küçük ve orta ölçekli salonlar için çok kiracılı SaaS randevu ve işletme yönetimi platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className={cn(inter.variable)}>
      <body className="min-h-screen font-sans antialiased">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
