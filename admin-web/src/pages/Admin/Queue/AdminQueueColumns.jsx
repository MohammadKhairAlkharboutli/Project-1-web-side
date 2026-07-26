import { MoreHorizontal, MoveUpRight, Ban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import QueueStatusBadge from "./QueueStatusBadge";
import {
  canAdminMove,
  canAdminSkip,
  formatAppointmentTimeRange,
  formatEstimatedWait,
  formatQueueDate,
  formatQueueDateTime,
  getClosedTime,
  getPatientNameFromQueueItem,
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

function renderPriorityCell(isPriority) {
  if (!isPriority) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  return (
    <Badge variant="destructive" className="bg-red-50 text-red-700">
      Priority
    </Badge>
  );
}

function renderQueueActionsCell(queueItem, onMove, onSkip) {
  const showMove = canAdminMove(queueItem);
  const showSkip = canAdminSkip(queueItem);

  if (!showMove && !showSkip) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="bg-white"
            aria-label="Open queue actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {showMove && (
            <DropdownMenuItem onSelect={() => onMove(queueItem)}>
              <MoveUpRight className="h-4 w-4" />
              Move
            </DropdownMenuItem>
          )}
          {showMove && showSkip && <DropdownMenuSeparator />}
          {showSkip && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onSkip(queueItem)}
            >
              <Ban className="h-4 w-4" />
              Skip
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function getActiveQueueColumns({ onMove, onSkip }) {
  return [
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">
          #{row.original.position}
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
      accessorKey: "estimatedWaitMinutes",
      header: "Est. Wait",
      cell: ({ row }) => formatEstimatedWait(row.original.estimatedWaitMinutes),
    },
    {
      accessorKey: "checkinTime",
      header: "Checked In",
      cell: ({ row }) => formatQueueDateTime(row.original.checkinTime),
    },
    {
      accessorKey: "isPriority",
      header: "Priority",
      cell: ({ row }) => renderPriorityCell(row.original.isPriority),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => renderQueueActionsCell(row.original, onMove, onSkip),
    },
  ];
}

export function getHistoryQueueColumns() {
  return [
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">
          #{row.original.position}
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
      accessorKey: "checkinTime",
      header: "Checked In",
      cell: ({ row }) => formatQueueDateTime(row.original.checkinTime),
    },
    {
      id: "closed",
      accessorFn: (queueItem) => getClosedTime(queueItem) ?? "",
      header: "Closed",
      cell: ({ row }) => formatQueueDateTime(getClosedTime(row.original)),
    },
    {
      accessorKey: "isPriority",
      header: "Priority",
      cell: ({ row }) => renderPriorityCell(row.original.isPriority),
    },
  ];
}
