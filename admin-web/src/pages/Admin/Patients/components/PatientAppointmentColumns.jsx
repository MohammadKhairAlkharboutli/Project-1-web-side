import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getAppointmentTimePositionLabel,
  getClinicName,
  getDoctorDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";

export function getPatientAppointmentColumns() {
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
