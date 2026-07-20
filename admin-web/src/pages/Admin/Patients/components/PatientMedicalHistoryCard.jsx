import { Link } from "react-router-dom";

import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import {
  formatAppointmentDate,
  formatAppointmentTime,
  formatAppointmentTimeRange,
} from "@/components/shared/Appointments/appointmentUtils";
import PrescriptionCard from "@/components/shared/Prescriptions/PrescriptionCard";

const EMPTY_VALUE = "Not specified";

function formatOptionalValue(value) {
  return value ? value : EMPTY_VALUE;
}

function getDoctorName(doctorProfile) {
  if (doctorProfile?.user?.full_name) {
    return doctorProfile.user.full_name;
  }

  const name = [
    doctorProfile?.user?.firstName,
    doctorProfile?.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return name || EMPTY_VALUE;
}

function normalizeAppointmentStatus(status) {
  return status ? String(status).toLowerCase() : status;
}

function getAppointmentDateLabel(appointment) {
  return appointment?.requestedDate
    ? formatAppointmentDate(appointment.requestedDate)
    : EMPTY_VALUE;
}

function getAppointmentTimeLabel(appointment) {
  if (!appointment?.startTime && !appointment?.endTime) {
    return EMPTY_VALUE;
  }

  if (appointment?.startTime && appointment?.endTime) {
    return formatAppointmentTimeRange(appointment);
  }

  return appointment?.startTime
    ? formatAppointmentTime(appointment.startTime)
    : formatAppointmentTime(appointment.endTime);
}

function MedicalHistoryDetail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm leading-6 text-slate-700">
        {formatOptionalValue(value)}
      </p>
    </div>
  );
}

export default function PatientMedicalHistoryCard({ history, medicines = [] }) {
  const appointment = history?.appointment;
  const appointmentId = appointment?.id || history?.appointmentId;
  const hasAppointmentLink = Boolean(appointmentId);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/80 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              {getAppointmentDateLabel(appointment)}
            </h3>
            <AppointmentStatusBadge
              status={normalizeAppointmentStatus(appointment?.status)}
            />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <span>
              <span className="font-medium text-slate-900">Time:</span>{" "}
              {getAppointmentTimeLabel(appointment)}
            </span>
            <span>
              <span className="font-medium text-slate-900">Doctor:</span>{" "}
              {getDoctorName(history?.doctorProfile)}
            </span>
          </div>
        </div>

        {hasAppointmentLink ? (
          <Link
            to={`/admin/appointments/${appointmentId}`}
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View appointment
          </Link>
        ) : null}
      </div>

      <div className="space-y-5 p-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <MedicalHistoryDetail
            label="Diagnosis"
            value={history?.diagnosis}
          />
          <MedicalHistoryDetail
            label="Treatment Plan"
            value={history?.treatmentPlan}
          />
          <MedicalHistoryDetail
            label="Doctor Notes"
            value={history?.doctorNotes}
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-slate-900">
              Visit Prescriptions
            </h4>
          </div>

          {medicines.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {medicines.map((medicine) => (
                <PrescriptionCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                No prescriptions for this visit.
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
