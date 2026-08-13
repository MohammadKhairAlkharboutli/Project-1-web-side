import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { ratingsApi } from "@/api/ratingsApi";
import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";
import RatingReportStatusBadge from "@/components/shared/Ratings/RatingReportStatusBadge";
import RatingScoreBadge from "@/components/shared/Ratings/RatingScoreBadge";
import {
  formatRatingDate,
  getRatingDoctorName,
  getRatingPatientName,
  getReportReasonLabel,
} from "@/components/shared/Ratings/ratingUtils";
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
import { Button } from "@/components/ui/button";

import RatingDetails from "./RatingDetails";

function InfoItem({ label, value }) {
  return (
    <div className={profileCardShell}>
      <p className={profileCardLabel}>{label}</p>
      <p className={profileCardValue}>{value || "N/A"}</p>
    </div>
  );
}

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this rating report. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function RatingReportDetails() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionAction, setResolutionAction] = useState(null);
  const [isRatingDetailsOpen, setIsRatingDetailsOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadReport() {
      try {
        const response = await ratingsApi.getAdminReports({
          page: 1,
          limit: 100,
          search: reportId,
        });
        const matchingReport = response.data.find(
          (item) => String(item.id) === reportId,
        );

        if (isCurrent) {
          setReport(matchingReport ?? null);
          setLoadError(
            matchingReport ? "" : "The rating report you requested does not exist.",
          );
        }
      } catch (error) {
        if (isCurrent) {
          setReport(null);
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, reportId]);

  async function resolveReport(action) {
    if (!report) {
      return;
    }

    setIsResolving(true);
    setActionError("");
    setActionNotice("");

    try {
      const updatedReport = await ratingsApi.resolveReport(report.id, action);
      setReport((currentReport) => ({
        ...currentReport,
        ...updatedReport,
        rating:
          action === "accept" && currentReport?.rating
            ? { ...currentReport.rating, ...updatedReport.rating, status: "hidden" }
            : updatedReport.rating ?? currentReport?.rating,
      }));
      setResolutionAction(null);
      setActionNotice(
        action === "accept"
          ? "Report resolved and rating hidden successfully."
          : "Report dismissed successfully.",
      );
    } catch (error) {
      setActionError(
        getErrorMessage(error, "We could not resolve this rating report."),
      );
    } finally {
      setIsResolving(false);
    }
  }

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading rating report...</p>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Rating report not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
        <Button className="mt-4" variant="outline" size="sm" onClick={retryLoad}>
          Try again
        </Button>
      </section>
    );
  }

  const rating = report.rating;
  const isPending = report.status === "pending";

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Rating Report #{report.id}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Report details and reported rating context.
              </p>
            </div>
            <RatingReportStatusBadge status={report.status} />
          </div>

          {actionNotice ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
              {actionNotice}
            </p>
          ) : null}

          {actionError && !resolutionAction ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoItem label="Reason" value={getReportReasonLabel(report.reason)} />
            <InfoItem
              label="Reporter"
              value={
                <Link
                  to={`/admin/patients/${report.reporterPatientId}`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {report.reporterPatient?.user?.full_name || "Unknown Patient"}
                </Link>
              }
            />
            <InfoItem label="Created" value={formatRatingDate(report.createdAt)} />
            <InfoItem label="Resolved At" value={formatRatingDate(report.resolvedAt)} />
            <InfoItem label="Resolved By Admin" value={report.resolvedByAdminId} />
            <InfoItem
              label="Reported Rating"
              value={
                <Button
                  variant="link"
                  className="h-auto p-0 text-[var(--color-primary)]"
                  onClick={() => setIsRatingDetailsOpen(true)}
                >
                  Rating #{report.ratingId}
                </Button>
              }
            />

            <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
              <p className={profileCardLabel}>Report Explanation</p>
              <p className={profileCardBody}>
                {report.explanation || "No explanation provided."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Reported Rating
              </h2>
              <RatingScoreBadge score={rating?.score} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="Doctor" value={getRatingDoctorName(rating)} />
              <InfoItem label="Reviewer" value={getRatingPatientName(rating)} />
              <InfoItem label="Status" value={rating?.status} />
              <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
                <p className={profileCardLabel}>Comment</p>
                <p className={profileCardBody}>
                  {rating?.comment || "No comment"}
                </p>
              </div>
            </div>
          </div>

          {isPending ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setActionError(""); setResolutionAction("accept"); }} disabled={isResolving}>
                {isResolving ? "Resolving..." : "Accept report"}
              </Button>
              <Button variant="outline" onClick={() => { setActionError(""); setResolutionAction("dismiss"); }} disabled={isResolving}>
                Dismiss report
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <RatingDetails
        rating={rating}
        open={isRatingDetailsOpen}
        onOpenChange={setIsRatingDetailsOpen}
      />

      <AlertDialog
        open={Boolean(resolutionAction)}
        onOpenChange={(open) => {
          if (!open && !isResolving) {
            setResolutionAction(null);
            setActionError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {resolutionAction === "accept"
                ? "Accept report and hide rating?"
                : "Dismiss report?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resolutionAction === "accept"
                ? "The reported rating will be hidden and this report will be marked resolved."
                : "This report will be marked resolved and the rating will remain visible."}
            </AlertDialogDescription>
            {actionError ? (
              <p className="text-sm text-red-700" role="alert">{actionError}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResolving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isResolving}
              onClick={(event) => {
                event.preventDefault();
                resolveReport(resolutionAction);
              }}
            >
              {isResolving
                ? "Resolving..."
                : resolutionAction === "accept"
                  ? "Accept report"
                  : "Dismiss report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
