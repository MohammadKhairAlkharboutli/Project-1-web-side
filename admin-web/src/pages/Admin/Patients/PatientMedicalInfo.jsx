import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
  sharedEmptyStateShell,
} from "@/components/shared/styles";
import { Button } from "@/components/ui/button";

import { formatEnumLabel, formatOptionalValue } from "./patientUtils";
import MedicalAttachmentsTable from "./components/MedicalAttachmentsTable";

function isNotFoundError(error) {
  return error?.response?.status === 404;
}

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : message || "We could not load the medical information. Please try again.";
}

export default function PatientMedicalInfo() {
  const { patient } = useOutletContext();
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [profileAttachments, setProfileAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadMedicalInfo() {
      setIsLoading(true);
      setLoadError("");
      setMedicalProfile(null);
      setProfileAttachments([]);

      const [profileResult, attachmentsResult] = await Promise.allSettled([
        adminPatientsApi.getMedicalProfile(patient.id),
        adminPatientsApi.getAttachments(patient.id),
      ]);

      if (!isCurrent) {
        return;
      }

      const failingResult = [profileResult, attachmentsResult].find(
        (result) => result.status === "rejected" && !isNotFoundError(result.reason),
      );

      if (failingResult) {
        setLoadError(getErrorMessage(failingResult.reason));
      } else {
        setMedicalProfile(
          profileResult.status === "fulfilled" ? profileResult.value : null,
        );
        setProfileAttachments(
          attachmentsResult.status === "fulfilled"
            ? attachmentsResult.value.profileAttachments
            : [],
        );
      }

      setIsLoading(false);
    }

    loadMedicalInfo();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, patient.id]);

  async function handleDownload(attachment) {
    setDownloadError("");
    setDownloadingAttachmentId(attachment.id);

    try {
      await adminPatientsApi.downloadAttachment(attachment.id, attachment.originalName);
    } catch (error) {
      setDownloadError(
        getErrorMessage(error).replace(
          "medical information",
          "this attachment",
        ),
      );
    } finally {
      setDownloadingAttachmentId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Medical Info
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Medical profile details associated with this patient record.
        </p>
      </div>

      {isLoading ? (
        <div className={`${sharedEmptyStateShell} p-5`}>
          <p className="text-sm font-medium text-slate-700">
            Loading medical information...
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
      ) : medicalProfile ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className={profileCardShell}>
            <p className={profileCardLabel}>Blood Type</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.bloodType)}
            </p>
          </div>

          <div className={profileCardShell}>
            <p className={profileCardLabel}>Pregnancy Status</p>
            <p className={profileCardValue}>
              {formatEnumLabel(medicalProfile.pregnancyStatus)}
            </p>
          </div>

          <div className={profileCardShell}>
            <p className={profileCardLabel}>Disability Info</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.disabilityInfo)}
            </p>
          </div>

          <div className={profileCardShell}>
            <p className={profileCardLabel}>Current Symptoms</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.currentSymptoms)}
            </p>
          </div>

          <div className={profileCardShell}>
            <p className={profileCardLabel}>Allergies</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.allergies)}
            </p>
          </div>

          <div className={profileCardShell}>
            <p className={profileCardLabel}>Chronic Conditions</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.chronicConditions)}
            </p>
          </div>

          <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
            <p className={profileCardLabel}>Past Surgeries</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.pastSurgeries)}
            </p>
          </div>

          <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
            <p className={profileCardLabel}>Family History</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.familyHistory)}
            </p>
          </div>

          <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
            <p className={profileCardLabel}>Current Medications</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.currentMedications)}
            </p>
          </div>

          <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
            <p className={profileCardLabel}>Lifestyle Habits</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.lifestyleHabits)}
            </p>
          </div>

          <div className={profileCardShell}>
            <p className={profileCardLabel}>Vaccination Status</p>
            <p className={profileCardValue}>
              {formatOptionalValue(medicalProfile.vaccinationStatus)}
            </p>
          </div>
        </div>
      ) : (
        <div className={`${sharedEmptyStateShell} p-5`}>
          <p className="text-sm font-medium text-slate-700">
            No medical profile has been recorded for this patient.
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
              Documents attached to this patient&apos;s medical profile.
            </p>
          </div>

          <MedicalAttachmentsTable
            attachments={profileAttachments}
            emptyMessage="No medical profile attachments."
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
