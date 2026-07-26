import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { getRatingLabel } from "./ratingUtils";

export default function RatingScoreBadge({ score }) {
  return (
    <Badge variant={Number(score) >= 4 ? "default" : "secondary"}>
      <Star className="h-3 w-3" />
      {score || "N/A"} · {getRatingLabel(score)}
    </Badge>
  );
}
