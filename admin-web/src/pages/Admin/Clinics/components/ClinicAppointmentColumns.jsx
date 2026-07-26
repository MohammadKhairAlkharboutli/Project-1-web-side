import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getAppointmentTimePositionLabel,
  getDoctorDisplayName,
  getPatientDisplayName,
  getQueueLabel,
} from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";

export function getClinicAppointmentColumns() {
  return [
    {
      id: "doctor",
      accessorFn: (appointment) => getDoctorDisplayName(appointment),
      header: "Doctor",
      cell: ({ row }) => (
        <Link
          to={`/admin/doctors/${row.original.doctorId}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {getDoctorDisplayName(row.original)}
        </Link>
      ),
    },
    {
      id: "patient",
      accessorFn: (appointment) => getPatientDisplayName(appointment),
      header: "Patient",
      cell: ({ row }) => (
        <Link
          to={`/admin/patients/${row.original.patientId}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {getPatientDisplayName(row.original)}
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
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/appointments/${row.original.id}`}>
            <Eye className="h-4 w-4" />
            Details
          </Link>
        </Button>
      ),
    },
  ];
}
