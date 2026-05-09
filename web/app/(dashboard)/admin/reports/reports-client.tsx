"use client";

import { useMemo, useState, useTransition } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RevenueReportComputed } from "@/lib/business/revenue-report";
import { REPORT_TIMEZONE } from "@/lib/business/revenue-report";
import { loadRevenueReportAction } from "./actions";

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function lastDayOfMonthKey(monthKey: string): string {
  const [yy, mm] = monthKey.split("-").map(Number);
  const d = new Date(yy, mm, 0).getDate();
  return `${monthKey}-${String(d).padStart(2, "0")}`;
}

type Props = {
  initialMonthKey: string;
  initialReportDayKey: string;
  initialReport: RevenueReportComputed | null;
  initialError: string | null;
};

export function ReportsClient({
  initialMonthKey,
  initialReportDayKey,
  initialReport,
  initialError,
}: Props) {
  const [monthKey, setMonthKey] = useState(initialMonthKey);
  const [reportDayKey, setReportDayKey] = useState(initialReportDayKey);
  const [report, setReport] = useState<RevenueReportComputed | null>(initialReport);
  const [error, setError] = useState<string | null>(initialError);
  const [pending, startTransition] = useTransition();

  function refresh(nextMonth: string, nextDay: string) {
    startTransition(async () => {
      const res = await loadRevenueReportAction({
        monthKey: nextMonth,
        reportDayKey: nextDay,
      });
      if (res.error) {
        setError(res.error);
        setReport(null);
        return;
      }
      setError(null);
      setReport(res.report);
    });
  }

  const summaryStats = useMemo(() => {
    if (!report) return [];
    return [
      {
        label: "Gerçekleşen randevu (ay)",
        value: String(report.realizedCountMonth),
        hint: "Onaylı veya tamamlanmış",
      },
      {
        label: "Toplam gelir (ay)",
        value: formatTry(report.realizedRevenueMonth),
        hint: "Hizmet fiyatları toplamı",
      },
      {
        label: "Rapor günü",
        value: report.reportDayKey.split("-").reverse().join("."),
        hint: `Personel günlük tablosu (${REPORT_TIMEZONE})`,
      },
    ];
  }, [report]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gelir ve performans</h1>
        <p className="text-muted-foreground">
          Onaylanmış randevular gerçekleşmiş sayılır; gelir önce rezervasyon sırasında sabitlenen tutara, bu bilgi
          yoksa (eski kayıtlar) güncel hizmet fiyatına göre hesaplanır.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="report-month">Ay</Label>
          <input
            id="report-month"
            type="month"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={monthKey}
            onChange={(e) => {
              const v = e.target.value;
              const nextDay = reportDayKey.startsWith(v) ? reportDayKey : `${v}-01`;
              setMonthKey(v);
              setReportDayKey(nextDay);
              refresh(v, nextDay);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="report-day">Personel günlük tablosu — gün</Label>
          <input
            id="report-day"
            type="date"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={reportDayKey}
            min={`${monthKey}-01`}
            max={lastDayOfMonthKey(monthKey)}
            onChange={(e) => {
              const v = e.target.value;
              setReportDayKey(v);
              if (v.startsWith(monthKey)) {
                refresh(monthKey, v);
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => refresh(monthKey, reportDayKey)}
        >
          {pending ? "Yükleniyor..." : "Yenile"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {report ? (
        <>
          <StatsCards stats={summaryStats} />

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Günlük özet (seçilen ay)</h2>
            <p className="text-sm text-muted-foreground">
              Her satır İstanbul saatiyle o güne düşen gerçekleşen randevuları gösterir.
            </p>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">Randevu</TableHead>
                    <TableHead className="text-right">Gelir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.dailyRows.map((row) => (
                    <TableRow key={row.dayKey}>
                      <TableCell>{row.dayLabel}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatTry(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Personel bazlı gelir — ay</h2>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personel</TableHead>
                    <TableHead className="text-right">Randevu</TableHead>
                    <TableHead className="text-right">Gelir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.staffMonthly.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Bu ay için kayıt yok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.staffMonthly.map((row) => (
                      <TableRow key={row.staffId}>
                        <TableCell className="font-medium">{row.staffName}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatTry(row.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Personel bazlı gelir — gün ({report.reportDayKey.split("-").reverse().join(".")})
            </h2>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personel</TableHead>
                    <TableHead className="text-right">Randevu</TableHead>
                    <TableHead className="text-right">Gelir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.staffDaily.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Bu gün için gerçekleşen randevu yok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.staffDaily.map((row) => (
                      <TableRow key={row.staffId}>
                        <TableCell className="font-medium">{row.staffName}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatTry(row.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
