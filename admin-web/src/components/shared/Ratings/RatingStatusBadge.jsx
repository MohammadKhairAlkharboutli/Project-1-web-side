import { Badge } from "@/components/ui/badge";

import {
  getRatingStatusLabel,
  getRatingStatusVariant,
} from "./ratingUtils";

export default function RatingStatusBadge({ status }) {
  return (
    <Badge variant={getRatingStatusVariant(status)}>
      {getRatingStatusLabel(status)}
    </Badge>
  );
}
