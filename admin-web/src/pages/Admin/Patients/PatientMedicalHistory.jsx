import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import { sharedEmptyStateShell } from "@/components/shared/styles";
import { Button } from "@/components/ui/button";

import MedicalAttachmentsTable from "./components/MedicalAttachmentsTable";
import PatientMedicalHistoryCard from "./components/PatientMedicalHistoryCard";

function getHistorySortDate(history) {
  const appointmentDate = history?.appointment?.requestedDate;
  const startTime = history?.appointment?.startTime || "00:00:00";
  const rawValue = appointmentDate
    ? `${appointmentDate}T${startTime}`
    : history?.createdAt;
  const date = rawValue ? new Date(rawValue) : null;

  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function isNotFoundError(error) {
  return error?.response?.status === 404;
}

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : message || "We could not load the medical history. Please try again.";
}

export default function PatientMedicalHistory() {
  const { patientId } = useParams();
  const { patient } = useOutletContext();
  const [searchParams] = useSearchParams();
  const appointmentFilterId = searchParams.get("appointmentId");
  const [histories, setHistories] = useState([]);
  const [historyAttachments, setHistoryAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadMedicalHistory() {
      setIsLoading(true);
      setLoadError("");
      setHistories([]);
      setHistoryAttachments([]);

      const [historiesResult, attachmentsResult] = await Promise.allSettled([
        adminPatientsApi.getMedicalHistories(patient.id),
        adminPatientsApi.getAttachments(patient.id),
      ]);

      if (!isCurrent) {
        return;
      }

      const failingResult = [historiesResult, attachmentsResult].find(
        (result) => result.status === "rejected" && !isNotFoundError(result.reason),
      );

      if (failingResult) {
        setLoadError(getErrorMessage(failingResult.reason));
      } else {
        setHistories(
          historiesResult.status === "fulfilled" ? historiesResult.value : [],
        );
        setHistoryAttachments(
          attachmentsResult.status === "fulfilled"
            ? attachmentsResult.value.historyAttachments
            : [],
        );
      }

      setIsLoading(false);
    }

    loadMedicalHistory();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, patient.id]);

  const visibleHistories = useMemo(() => {
    const sortedHistories = [...histories].sort(
      (firstHistory, secondHistory) =>
        getHistorySortDate(secondHistory) - getHistorySortDate(firstHistory),
    );

    if (!appointmentFilterId) {
      return sortedHistories;
    }

    return sortedHistories.filter((history) => {
      const historyAppointmentId = history.appointmentId || history.appointment?.id;
      return String(historyAppointmentId) === appointmentFilterId;
    });
  }, [appointmentFilterId, histories]);

  const visibleAttachments = useMemo(() => {
    if (!appointmentFilterId) {
      return historyAttachments;
    }

    const visibleHistoryIds = new Set(visibleHistories.map((history) => String(history.id)));
    return historyAttachments.filter((attachment) =>
      visibleHistoryIds.has(String(attachment.medicalHistoryId)),
    );
  }, [appointmentFilterId, historyAttachments, visibleHistories]);

  async function handleDownload(attachment) {
    setDownloadError("");
    setDownloadingAttachmentId(attachment.id);

    try {
      await adminPatientsApi.downloadAttachment(attachment.id, attachment.originalName);
    } catch (error) {
      setDownloadError(
        getErrorMessage(error).replace("medical history", "this attachment"),
      );
    } finally {
      setDownloadingAttachmentId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Medical History
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {appointmentFilterId
            ? `Showing the medical history record connected to appointment #${appointmentFilterId}.`
            : "Visit-specific clinical records and prescriptions for this patient."}
        </p>
      </div>

      {appointmentFilterId ? (
        <div className="flex">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/patients/${patientId}/medical-history`}>
              Show all history
            </Link>
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className={`${sharedEmptyStateShell} p-5`}>
          <p className="text-sm font-medium text-slate-700">
            Loading medical history...
          </p>
        </div>
      ) : loadError ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          >
            Try again
          </Button>
        </div>
      ) : visibleHistories.length > 0 ? (
        <div className="space-y-4">
          {visibleHistories.map((history) => (
            <PatientMedicalHistoryCard
              key={history.id}
              history={history}
              medicines={history.medicines}
            />
          ))}
        </div>
      ) : (
        <div className={`${sharedEmptyStateShell} p-5`}>
          <p className="text-sm font-medium text-slate-700">
            {appointmentFilterId
              ? "No medical history record is connected to this appointment."
              : "No medical history entries."}
          </p>
        </div>
      )}

      {!isLoading && !loadError ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Medical Attachments
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Documents attached to this patient&apos;s visit history.
            </p>
          </div>

          <MedicalAttachmentsTable
            attachments={visibleAttachments}
            emptyMessage="No medical history attachments."
            onDownload={handleDownload}
            downloadingAttachmentId={downloadingAttachmentId}
          />

          {downloadError ? (
            <p className="text-sm text-red-700" role="alert">
              {downloadError}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
