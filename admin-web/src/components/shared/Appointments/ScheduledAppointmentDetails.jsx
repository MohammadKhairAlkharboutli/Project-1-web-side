import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  formatDateTime,
  getAppointmentTimePositionLabel,
  getClinicName,
  getDoctorDisplayName,
  getPatientDisplayName,
  getQueueLabel,
  getPriorityLabel,
} from "./appointmentUtils";
import {
  AppointmentInfoGrid,
  AppointmentInfoItem,
  AppointmentTextItem,
} from "./AppointmentDetailBlocks";

export default function ScheduledAppointmentDetails({ appointment }) {
  return (
    <AppointmentInfoGrid>
      <AppointmentInfoItem label="Date" value={formatAppointmentDate(appointment.requestedDate)} />
      <AppointmentInfoItem label="Time" value={formatAppointmentTimeRange(appointment)} />
      <AppointmentInfoItem label="Timing" value={getAppointmentTimePositionLabel(appointment)} />
      <AppointmentInfoItem label="Patient" value={getPatientDisplayName(appointment)} />
      <AppointmentInfoItem label="Doctor" value={getDoctorDisplayName(appointment)} />
      <AppointmentInfoItem label="Clinic" value={getClinicName(appointment)} />
      <AppointmentInfoItem label="Type" value={appointment.type} />
      <AppointmentInfoItem label="Priority" value={getPriorityLabel(appointment.priority)} />
      <AppointmentInfoItem label="Queue" value={getQueueLabel(appointment)} />
      <AppointmentInfoItem label="Checked In" value={formatDateTime(appointment.checkinTime)} />
      <AppointmentTextItem label="Reason For Visit" value={appointment.reasonForVisit} />
      <AppointmentTextItem label="Symptoms" value={appointment.symptoms} />
      <AppointmentTextItem label="Notes" value={appointment.notes} />
    </AppointmentInfoGrid>
  );
}
