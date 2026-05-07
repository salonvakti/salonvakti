import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Stat = { label: string; value: string; hint?: string };

type Props = {
  stats: Stat[];
};

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">{s.value}</p>
            {s.hint ? <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
