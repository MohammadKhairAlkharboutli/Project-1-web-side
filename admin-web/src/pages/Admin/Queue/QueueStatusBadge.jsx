import { Badge } from "@/components/ui/badge";

import { QUEUE_STATUS, getQueueStatusLabel } from "./queueUtils";

const STATUS_CLASSES = {
  [QUEUE_STATUS.WAITING]: "bg-amber-50 text-amber-700",
  [QUEUE_STATUS.CALLING]: "bg-sky-50 text-sky-700",
  [QUEUE_STATUS.IN_PROGRESS]: "bg-indigo-50 text-indigo-700",
  [QUEUE_STATUS.COMPLETED]: "bg-emerald-50 text-emerald-700",
  [QUEUE_STATUS.SKIPPED]: "bg-slate-100 text-slate-600",
};

export default function QueueStatusBadge({ status }) {
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      {getQueueStatusLabel(status)}
    </Badge>
  );
}
