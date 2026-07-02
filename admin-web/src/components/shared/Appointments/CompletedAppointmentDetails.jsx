import { Button } from "@/components/ui/button";

import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  formatDateTime,
  getClinicName,
  getDoctorDisplayName,
  getPatientDisplayName,
  getPriorityLabel,
  getQueueLabel,
} from "./appointmentUtils";
import {
  AppointmentInfoGrid,
  AppointmentInfoItem,
  AppointmentTextItem,
} from "./AppointmentDetailBlocks";

function formatPayment(payment) {
  if (!payment) {
    return "N/A";
  }

  const amount =
    typeof payment.amount === "number" ? `$${payment.amount.toFixed(0)}` : payment.amount;

  return `${amount || "N/A"} - ${payment.status || "Unknown"}`;
}

function formatRating(rating) {
  if (!rating) {
    return "N/A";
  }

  return `${rating.score || "N/A"} / 5`;
}

export default function CompletedAppointmentDetails({ appointment }) {
  return (
    <div className="space-y-4">
      <AppointmentInfoGrid>
        <AppointmentInfoItem label="Date" value={formatAppointmentDate(appointment.requestedDate)} />
        <AppointmentInfoItem label="Scheduled Time" value={formatAppointmentTimeRange(appointment)} />
        <AppointmentInfoItem label="Actual Start" value={formatDateTime(appointment.actualStartTime)} />
        <AppointmentInfoItem label="Actual End" value={formatDateTime(appointment.actualEndTime)} />
        <AppointmentInfoItem label="Patient" value={getPatientDisplayName(appointment)} />
        <AppointmentInfoItem label="Doctor" value={getDoctorDisplayName(appointment)} />
        <AppointmentInfoItem label="Clinic" value={getClinicName(appointment)} />
        <AppointmentInfoItem label="Type" value={appointment.type} />
        <AppointmentInfoItem label="Priority" value={getPriorityLabel(appointment.priority)} />
        <AppointmentInfoItem label="Queue" value={getQueueLabel(appointment)} />
        <AppointmentInfoItem label="Payment" value={formatPayment(appointment.payment)} />
        <AppointmentInfoItem label="Rating" value={formatRating(appointment.rating)} />
        <AppointmentTextItem label="Reason For Visit" value={appointment.reasonForVisit} />
        <AppointmentTextItem label="Symptoms" value={appointment.symptoms} />
        <AppointmentTextItem label="Notes" value={appointment.notes} />
        <AppointmentTextItem label="Rating Comment" value={appointment.rating?.comment} />
      </AppointmentInfoGrid>

      <Button variant="outline" disabled>
        View medical history record
      </Button>
    </div>
  );
}
