import { Ban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import QueueStatusBadge from "./QueueStatusBadge";
import {
  canAdminSkip,
  formatAppointmentTimeRange,
  formatEstimatedWait,
  formatQueueDate,
  formatQueueDateTime,
  getPatientNameFromQueueItem,
  getQueuePriorityGroupLabel,
} from "./queueUtils";

function renderAppointmentCell(appointment) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-slate-900">
        {formatQueueDate(appointment?.requestedDate)}
      </p>
      <p className="text-sm text-slate-500">
        {formatAppointmentTimeRange(appointment)}
      </p>
      {appointment?.type && (
        <p className="text-xs capitalize text-slate-500">{appointment.type}</p>
      )}
    </div>
  );
}

function renderQueueGroupCell(priorityGroup) {
  return (
    <Badge
      variant="outline"
      className={
        priorityGroup === "late"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-sky-200 bg-sky-50 text-sky-700"
      }
    >
      {getQueuePriorityGroupLabel(priorityGroup)}
    </Badge>
  );
}

function renderQueueActionsCell(queueItem, onSkip) {
  const showSkip = canAdminSkip(queueItem);

  if (!showSkip) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        onClick={() => onSkip(queueItem)}
      >
        <Ban className="h-4 w-4" />
        Skip
      </Button>
    </div>
  );
}

export function getActiveQueueColumns({ onSkip }) {
  return [
    {
      accessorKey: "currentPosition",
      header: "Position",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">
          {row.original.currentPosition == null
            ? "—"
            : `#${row.original.currentPosition}`}
        </span>
      ),
    },
    {
      id: "patient",
      accessorFn: (queueItem) => getPatientNameFromQueueItem(queueItem),
      header: "Patient",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">
          {getPatientNameFromQueueItem(row.original)}
        </span>
      ),
    },
    {
      id: "appointment",
      accessorFn: (queueItem) =>
        `${queueItem?.appointment?.requestedDate ?? ""} ${queueItem?.appointment?.startTime ?? ""}`,
      header: "Appointment",
      cell: ({ row }) => renderAppointmentCell(row.original.appointment),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <QueueStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "expectedWaitingTimeMinutes",
      header: "Est. Wait",
      cell: ({ row }) =>
        formatEstimatedWait(row.original.expectedWaitingTimeMinutes),
    },
    {
      accessorKey: "checkInAt",
      header: "Checked In",
      cell: ({ row }) => formatQueueDateTime(row.original.checkInAt),
    },
    {
      accessorKey: "priorityGroup",
      header: "Queue group",
      cell: ({ row }) => renderQueueGroupCell(row.original.priorityGroup),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => renderQueueActionsCell(row.original, onSkip),
    },
  ];
}
