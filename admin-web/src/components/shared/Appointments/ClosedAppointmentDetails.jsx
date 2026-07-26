import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  formatDateTime,
  getClinicName,
  getDoctorDisplayName,
  getPatientDisplayName,
  getPriorityLabel,
} from "./appointmentUtils";
import {
  AppointmentInfoGrid,
  AppointmentInfoItem,
  AppointmentTextItem,
} from "./AppointmentDetailBlocks";

export default function ClosedAppointmentDetails({ appointment }) {
  return (
    <AppointmentInfoGrid>
      <AppointmentInfoItem label="Date" value={formatAppointmentDate(appointment.requestedDate)} />
      <AppointmentInfoItem label="Time" value={formatAppointmentTimeRange(appointment)} />
      <AppointmentInfoItem label="Patient" value={getPatientDisplayName(appointment)} />
      <AppointmentInfoItem label="Doctor" value={getDoctorDisplayName(appointment)} />
      <AppointmentInfoItem label="Clinic" value={getClinicName(appointment)} />
      <AppointmentInfoItem label="Type" value={appointment.type} />
      <AppointmentInfoItem label="Priority" value={getPriorityLabel(appointment.priority)} />
      <AppointmentInfoItem label="Cancelled At" value={formatDateTime(appointment.cancelledAt)} />
      <AppointmentTextItem label="Cancellation Reason" value={appointment.cancellationReason} />
      <AppointmentTextItem label="Reason For Visit" value={appointment.reasonForVisit} />
      <AppointmentTextItem label="Symptoms" value={appointment.symptoms} />
      <AppointmentTextItem label="Notes" value={appointment.notes} />
    </AppointmentInfoGrid>
  );
}
