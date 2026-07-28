import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { sharedEmptyStateShell } from "@/components/shared/styles";
import { Button } from "@/components/ui/button";

import { patients } from "../PatientData";
import MedicalAttachmentsTable from "./components/MedicalAttachmentsTable";
import PatientMedicalHistoryCard from "./components/PatientMedicalHistoryCard";

function getHistorySortDate(history) {
  const appointmentDate = history?.appointment?.requestedDate;
  const startTime = history?.appointment?.startTime || "00:00:00";
  const rawValue = appointmentDate
    ? `${appointmentDate}T${startTime}`
    : history?.created_at;
  const date = rawValue ? new Date(rawValue) : null;

  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function groupMedicinesByHistoryId(medicines) {
  return medicines.reduce((groups, medicine) => {
    const historyId = medicine.medicalHistoryId;

    if (!historyId) {
      return groups;
    }

    return {
      ...groups,
      [historyId]: [...(groups[historyId] || []), medicine],
    };
  }, {});
}

export default function PatientMedicalHistory() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentFilterId = searchParams.get("appointmentId");
  const patient = patients.find((item) => String(item.id) === patientId);

  const histories = useMemo(() => {
    return [...(patient?.medicalHistories || [])].sort(
      (firstHistory, secondHistory) =>
        getHistorySortDate(secondHistory) - getHistorySortDate(firstHistory),
    );
  }, [patient]);

  const visibleHistories = useMemo(() => {
    if (!appointmentFilterId) {
      return histories;
    }

    return histories.filter((history) => {
      const historyAppointmentId = history?.appointmentId || history?.appointment?.id;

      return String(historyAppointmentId) === appointmentFilterId;
    });
  }, [appointmentFilterId, histories]);

  const medicinesByHistoryId = useMemo(() => {
    return groupMedicinesByHistoryId(
      patient?.prescribedMedicines?.historyMedicines || [],
    );
  }, [patient]);

  const historyAttachments = useMemo(() => {
    const attachments = patient?.medicalAttachments?.historyAttachments || [];

    if (!appointmentFilterId) {
      return attachments;
    }

    const visibleHistoryIds = new Set(visibleHistories.map((history) => String(history.id)));
    return attachments.filter((attachment) =>
      visibleHistoryIds.has(String(attachment.medicalHistoryId)),
    );
  }, [appointmentFilterId, patient, visibleHistories]);

  if (!patient) {
    return null;
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

      {visibleHistories.length > 0 ? (
        <div className="space-y-4">
          {visibleHistories.map((history) => (
            <PatientMedicalHistoryCard
              key={history.id}
              history={history}
              medicines={medicinesByHistoryId[history.id] || []}
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
          attachments={historyAttachments}
          emptyMessage="No medical history attachments."
        />
      </section>
    </div>
  );
}
