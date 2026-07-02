import { useMemo, useState } from "react";

import DataTable from "@/components/shared/DataTable";
import { mockRatingReports } from "@/components/shared/Ratings/mockRatingData";

import { getRatingReportColumns } from "./components/RatingReportColumns";
import RatingReportsToolbar from "./components/RatingReportsToolbar";

export default function RatingReportsPage() {
  const [reasonFilter, setReasonFilter] = useState("all");

  const reports = useMemo(
    () =>
      mockRatingReports.filter(
        (report) => reasonFilter === "all" || report.reason === reasonFilter,
      ),
    [reasonFilter],
  );

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setReasonFilter("all");
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Rating Reports
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review patient reports about public ratings.
        </p>
      </div>

      <DataTable
        columns={getRatingReportColumns()}
        data={reports}
        emptyMessage="No rating reports found."
        toolbar={(toolbarProps) => (
          <RatingReportsToolbar
            {...toolbarProps}
            reasonFilter={reasonFilter}
            setReasonFilter={setReasonFilter}
            onResetFilters={() =>
              resetFilters(toolbarProps.table, toolbarProps.setGlobalFilter)
            }
          />
        )}
      />
    </section>
  );
}
