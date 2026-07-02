import { Badge } from "@/components/ui/badge";

import {
  getReportStatusLabel,
  getReportStatusVariant,
} from "./ratingUtils";

export default function RatingReportStatusBadge({ status }) {
  return (
    <Badge variant={getReportStatusVariant(status)}>
      {getReportStatusLabel(status)}
    </Badge>
  );
}
