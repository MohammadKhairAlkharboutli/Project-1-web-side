import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

import AppointmentPriorityBadge from "./AppointmentPriorityBadge";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getAppointmentTimePositionLabel,
  getClinicName,
  getPatientDisplayName,
  getQueueLabel,
} from "./appointmentUtils";

export function getDoctorAppointmentColumns() {
  return [
    {
      id: "patient",
      accessorFn: (appointment) => getPatientDisplayName(appointment),
      header: "Patient",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Link
            to={`/admin/patients/${row.original.patientId}`}
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            {getPatientDisplayName(row.original)}
          </Link>
          <p className="text-sm text-slate-500">
            {row.original.patient?.user?.phone || "No phone"}
          </p>
        </div>
      ),
    },
    {
      id: "clinic",
      accessorFn: (appointment) => getClinicName(appointment),
      header: "Clinic",
      cell: ({ row }) => (
        <Link
          to={`/admin/clinics/${row.original.clinicId}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {getClinicName(row.original)}
        </Link>
      ),
    },
    {
      id: "dateTime",
      accessorFn: (appointment) =>
        `${formatAppointmentDate(appointment.requestedDate)} ${formatAppointmentTimeRange(appointment)}`,
      header: "Date & Time",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900">
            {formatAppointmentDate(row.original.requestedDate)}
          </p>
          <p className="text-sm text-slate-500">
            {formatAppointmentTimeRange(row.original)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <AppointmentPriorityBadge priority={row.original.priority} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-1">
          <AppointmentStatusBadge status={row.original.status} />
          <p className="text-xs text-slate-500">
            {getAppointmentTimePositionLabel(row.original)}
          </p>
        </div>
      ),
    },
    {
      id: "queue",
      accessorFn: (appointment) => getQueueLabel(appointment),
      header: "Queue",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/appointments/${row.original.id}`}>
              <Eye className="h-4 w-4" />
              Details
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}
