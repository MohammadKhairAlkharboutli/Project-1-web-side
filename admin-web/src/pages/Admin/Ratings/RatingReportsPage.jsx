import { useEffect, useMemo, useState } from "react";

import { ratingsApi } from "@/api/ratingsApi";
import DataTable from "@/components/shared/DataTable";

import { getRatingReportColumns } from "./components/RatingReportColumns";
import RatingReportsToolbar from "./components/RatingReportsToolbar";

const INITIAL_REPORT_FILTERS = [{ id: "status", value: "pending" }];

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function RatingReportsPage() {
  const [allReports, setAllReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionError, setActionError] = useState("");
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [reasonFilter, setReasonFilter] = useState("all");

  useEffect(() => {
    let isCurrent = true;

    async function loadReports() {
      try {
        const response = await ratingsApi.getAdminReports();

        if (isCurrent) {
          setAllReports(response.data);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error, "We could not load rating reports."));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt]);

  const reports = useMemo(
    () =>
      allReports.filter(
        (report) => reasonFilter === "all" || report.reason === reasonFilter,
      ),
    [allReports, reasonFilter],
  );

  async function resolveReport(report, action) {
    setResolvingReportId(report.id);
    setActionError("");

    try {
      const updatedReport = await ratingsApi.resolveReport(report.id, action);
      setAllReports((currentReports) =>
        currentReports.map((item) =>
          String(item.id) === String(updatedReport.id)
            ? { ...item, ...updatedReport, rating: updatedReport.rating ?? item.rating }
            : item,
        ),
      );
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not resolve this report."));
    } finally {
      setResolvingReportId(null);
    }
  }

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setReasonFilter("all");
  }

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
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
        columns={getRatingReportColumns({ resolveReport, resolvingReportId })}
        data={reports}
        emptyMessage={
          isLoading
            ? "Loading rating reports..."
            : loadError
              ? "Rating reports could not be loaded."
              : "No rating reports found."
        }
        initialColumnFilters={INITIAL_REPORT_FILTERS}
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

      {loadError || actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>{loadError || actionError}</p>
          {loadError ? (
            <button type="button" className="mt-2 font-medium underline" onClick={retryLoad}>
              Try again
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
