import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FloatingShapes } from "@/components/landing/landing-shared";
import { cn } from "@/lib/utils";

type Props = {
  siteName: string;
};

export function LandingCtaBand({ siteName }: Props) {
  return (
    <section className="slnvkt-cta-band relative overflow-hidden border-t bg-gradient-to-r from-primary via-primary to-primary py-16 text-primary-foreground md:py-20">
      <FloatingShapes className="opacity-40" />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {siteName} ile randevularınızı dijitale taşıyın
        </h2>
        <p className="mt-4 text-lg opacity-90">
          Birkaç dakikada işletme hesabınızı açın, randevu linkinizi paylaşın ve panelden yönetmeye başlayın.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-background text-foreground hover:bg-background/90"
            )}
          >
            Ücretsiz başla
            <ArrowRight className="h-4 w-4" data-icon="inline-end" />
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            )}
          >
            Giriş yap
          </Link>
        </div>
      </div>
    </section>
  );
}
