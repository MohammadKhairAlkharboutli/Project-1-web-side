import { useEffect, useMemo, useState } from "react";

import { ratingsApi } from "@/api/ratingsApi";
import DataTable from "@/components/shared/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [actionNotice, setActionNotice] = useState("");
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [reportResolution, setReportResolution] = useState(null);
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
    setActionNotice("");

    try {
      const updatedReport = await ratingsApi.resolveReport(report.id, action);
      setAllReports((currentReports) =>
        currentReports.map((item) =>
          String(item.id) === String(updatedReport.id)
            ? { ...item, ...updatedReport, rating: updatedReport.rating ?? item.rating }
            : item,
        ),
      );
      setReportResolution(null);
      setActionNotice(
        action === "accept"
          ? "Report resolved and rating hidden successfully."
          : "Report dismissed successfully.",
      );
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not resolve this report."));
    } finally {
      setResolvingReportId(null);
    }
  }

  function requestReportResolution(report, action) {
    setActionError("");
    setReportResolution({ report, action });
  }

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.resetSorting();
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
        columns={getRatingReportColumns({
          resolveReport: requestReportResolution,
          resolvingReportId,
        })}
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

      {actionNotice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {actionNotice}
        </div>
      ) : null}

      {loadError || (actionError && !reportResolution) ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>{loadError || actionError}</p>
          {loadError ? (
            <button type="button" className="mt-2 font-medium underline" onClick={retryLoad}>
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(reportResolution)}
        onOpenChange={(open) => {
          if (!open && !resolvingReportId) {
            setReportResolution(null);
            setActionError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reportResolution?.action === "accept"
                ? "Accept report and hide rating?"
                : "Dismiss report?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reportResolution?.action === "accept"
                ? "The reported rating will be hidden and this report will be marked resolved."
                : "This report will be marked resolved and the rating will remain visible."}
            </AlertDialogDescription>
            {actionError ? (
              <p className="text-sm text-red-700" role="alert">{actionError}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(resolvingReportId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(resolvingReportId)}
              onClick={(event) => {
                event.preventDefault();
                resolveReport(reportResolution.report, reportResolution.action);
              }}
            >
              {resolvingReportId
                ? "Resolving..."
                : reportResolution?.action === "accept"
                  ? "Accept report"
                  : "Dismiss report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
