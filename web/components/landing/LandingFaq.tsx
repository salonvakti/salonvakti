"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/landing-shared";
import { cn } from "@/lib/utils";

function buildFaqs(siteName: string) {
  return [
  {
    q: `${siteName} nedir?`,
    a: "Kuaför, berber ve güzellik merkezleri için çok kiracılı online randevu ve işletme yönetim platformudur. Her salon kendi paneli ve randevu linki ile çalışır.",
  },
  {
    q: "Nasıl kayıt olurum?",
    a: "İşletme oluştur sayfasından kayıt olun; size özel kısa adres (slug) ve yönetici hesabı oluşturulur. Deneme lisansı ile hemen panele geçebilirsiniz.",
  },
  {
    q: "Müşteriler randevuyu nasıl alır?",
    a: "İşletmenizin randevu adresini veya QR kodunu paylaşın. Müşteri hizmet, personel ve saat seçer; randevu işletme onayına düşer.",
  },
  {
    q: "Paketler arasındaki fark nedir?",
    a: "Basic tek şube ve temel özellikler sunar; Pro SMS, şube ve gelişmiş modüller ekler; Ultimate sınırsız limit ve kurumsal destek içerir.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Müşteri ve randevu verileri işletme sınırlarında tutulur. Yöneticiler dahi bu kişisel verilere erişemez.",
  },
];
}

export function LandingFaq({ siteName }: { siteName: string }) {
  const faqs = buildFaqs(siteName);
  const [open, setOpen] = useState(0);

  return (
    <section id="sss" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <SectionHeading
              center={false}
              badge="SSS"
              title="Sıkça sorulan sorular"
              subtitle={`${siteName} hakkında merak edilenler.`}
            />
            <p className="text-muted-foreground">
              Başka sorunuz mu var? İşletme kaydı oluşturarak denemeye başlayın.
            </p>
            <Link href="/register" className={buttonVariants()}>
              Ücretsiz dene
            </Link>
          </div>
          <div className="space-y-2">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="overflow-hidden rounded-xl border bg-card">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition-colors hover:bg-muted/50"
                  >
                    {item.q}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
