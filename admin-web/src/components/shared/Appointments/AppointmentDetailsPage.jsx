import AppointmentPriorityBadge from "./AppointmentPriorityBadge";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import ClosedAppointmentDetails from "./ClosedAppointmentDetails";
import CompletedAppointmentDetails from "./CompletedAppointmentDetails";
import ScheduledAppointmentDetails from "./ScheduledAppointmentDetails";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getAppointmentTimePositionLabel,
  isClosedAppointment,
  isCompletedAppointment,
} from "./appointmentUtils";

export default function AppointmentDetailsPage({ appointment, headerActions }) {
  if (!appointment) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          Appointment not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Appointment #{appointment.id}
            </h2>
            <AppointmentStatusBadge status={appointment.status} />
            <AppointmentPriorityBadge priority={appointment.priority} />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {formatAppointmentDate(appointment.requestedDate)} at{" "}
            {formatAppointmentTimeRange(appointment)} ·{" "}
            {getAppointmentTimePositionLabel(appointment)}
          </p>
        </div>
        {headerActions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{headerActions}</div>
        ) : null}
      </div>

      {isCompletedAppointment(appointment) ? (
        <CompletedAppointmentDetails appointment={appointment} />
      ) : isClosedAppointment(appointment) ? (
        <ClosedAppointmentDetails appointment={appointment} />
      ) : (
        <ScheduledAppointmentDetails appointment={appointment} />
      )}
    </div>
  );
}
