import { Badge } from "@/components/ui/badge";

import {
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from "./appointmentUtils";

export default function AppointmentStatusBadge({ status }) {
  return (
    <Badge variant={getAppointmentStatusVariant(status)}>
      {getAppointmentStatusLabel(status)}
    </Badge>
  );
}
