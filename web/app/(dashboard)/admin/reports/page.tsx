import { defaultReportSelection } from "@/lib/business/revenue-report";
import { loadRevenueReportAction } from "./actions";
import { ReportsClient } from "./reports-client";

export default async function AdminReportsPage() {
  const defaults = defaultReportSelection();
  const { report, error } = await loadRevenueReportAction(defaults);

  return (
    <ReportsClient
      initialMonthKey={defaults.monthKey}
      initialReportDayKey={defaults.reportDayKey}
      initialReport={report}
      initialError={error}
    />
  );
}
