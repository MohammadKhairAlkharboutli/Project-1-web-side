import { useEffect, useState } from "react";

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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { getRatingReportColumns } from "./components/RatingReportColumns";
import RatingReportsToolbar from "./components/RatingReportsToolbar";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function RatingReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearchState] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [reportResolution, setReportResolution] = useState(null);
  const [reasonFilter, setReasonFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    let isCurrent = true;

    async function loadReports() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await ratingsApi.getAdminReports({
          page,
          limit,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(reasonFilter !== "all" ? { reason: reasonFilter } : {}),
        });

        if (isCurrent) {
          setReports(response.data);
          setTotal(response.total);
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
  }, [debouncedSearch, limit, loadAttempt, page, reasonFilter, statusFilter]);

  async function resolveReport(report, action) {
    setResolvingReportId(report.id);
    setActionError("");
    setActionNotice("");

    try {
      const updatedReport = await ratingsApi.resolveReport(report.id, action);
      setReports((currentReports) =>
        currentReports.map((item) =>
          String(item.id) === String(updatedReport.id)
            ? {
                ...item,
                ...updatedReport,
                rating: updatedReport.rating
                  ? { ...item.rating, ...updatedReport.rating }
                  : item.rating,
              }
            : item,
        ),
      );
      setReportResolution(null);
      setActionNotice(
        action === "accept"
          ? "Report resolved and rating hidden successfully."
          : "Report dismissed successfully.",
      );
      setLoadAttempt((attempt) => attempt + 1);
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

  function setSearch(value) {
    setSearchState(value);
    setPage(1);
  }

  function setStatus(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function setReason(value) {
    setReasonFilter(value);
    setPage(1);
  }

  function resetFilters(table) {
    setSearchState("");
    setStatusFilter("pending");
    setReasonFilter("all");
    table.resetSorting();
    table.setPageIndex(0);
    setPage(1);
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
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        serverFiltering
        sorting={false}
        serverPagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
          onPageSizeChange: (nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          },
        }}
        emptyMessage={
          isLoading
            ? "Loading rating reports..."
            : loadError
              ? "Rating reports could not be loaded."
              : "No rating reports found."
        }
        toolbar={(toolbarProps) => (
          <RatingReportsToolbar
            {...toolbarProps}
            statusFilter={statusFilter}
            setStatusFilter={setStatus}
            reasonFilter={reasonFilter}
            setReasonFilter={setReason}
            onResetFilters={() => resetFilters(toolbarProps.table)}
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
