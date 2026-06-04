import { Building2, CalendarCheck, Globe2, ThumbsUp } from "lucide-react";

type Props = { salonCount: number };

const items = [
  { icon: Building2, getValue: (n: number) => `${Math.max(n, 1)}+`, label: "Aktif işletme" },
  { icon: ThumbsUp, getValue: () => "7/24", label: "Online randevu" },
  { icon: CalendarCheck, getValue: () => "Tek", label: "Takvim paneli" },
  { icon: Globe2, getValue: () => "TR", label: "Türkiye odaklı" },
];

export function LandingStats({ salonCount }: Props) {
  return (
    <section className="slnvkt-stats-strip border-b">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:py-14">
        {items.map(({ icon: Icon, getValue, label }) => (
          <div key={label} className="text-center">
            <Icon className="mx-auto mb-3 h-8 w-8 opacity-90" aria-hidden />
            <p className="text-3xl font-extrabold tracking-tight md:text-4xl">{getValue(salonCount)}</p>
            <p className="mt-1 text-sm opacity-90">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
