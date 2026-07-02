import { Badge } from "@/components/ui/badge";

import {
  getPriorityLabel,
  getPriorityVariant,
} from "./appointmentUtils";

export default function AppointmentPriorityBadge({ priority }) {
  return (
    <Badge variant={getPriorityVariant(priority)}>
      {getPriorityLabel(priority)}
    </Badge>
  );
}
