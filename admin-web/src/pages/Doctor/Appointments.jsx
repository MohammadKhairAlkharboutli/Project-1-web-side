import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ListOrdered } from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import {
  APPOINTMENT_STATUS_OPTIONS,
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getClinicName,
  getPatientDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { getCurrentDoctorAppointments } from "./doctorPortalData";

const appointmentColumns = [
  {
    accessorFn: (appointment) => getPatientDisplayName(appointment),
    id: "patient",
    header: "Patient",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-900">
          {getPatientDisplayName(row.original)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.original.patient?.user?.phone ?? "No phone"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "requestedDate",
    header: "Date",
    cell: ({ row }) => formatAppointmentDate(row.original.requestedDate),
  },
  {
    accessorKey: "startTime",
    header: "Time",
    cell: ({ row }) => formatAppointmentTimeRange(row.original),
  },
  {
    accessorFn: (appointment) => getClinicName(appointment),
    id: "clinic",
    header: "Clinic",
    cell: ({ row }) => getClinicName(row.original),
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
    cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <Button
        asChild
        size="sm"
        variant="outline"
        className="border-slate-300 gap-1 text-slate-700"
      >
        <Link to="/doctor/queue">
          <ListOrdered size={14} />
          {row.original.status === "completed" ? "Completed" : "Check Queue"}
        </Link>
      </Button>
    ),
  },
];

export default function DoctorAppointments() {
  const [status, setStatus] = useState("all");
  const appointments = getCurrentDoctorAppointments();

  const filteredAppointments = useMemo(() => {
    if (status === "all") {
      return appointments;
    }

    return appointments.filter((appointment) => appointment.status === status);
  }, [appointments, status]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Appointments
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          View and manage appointments assigned to your profile.
        </p>
      </div>

      <DataTable
        columns={appointmentColumns}
        data={filteredAppointments}
        emptyMessage="No appointments found."
        toolbar={({ globalFilter, setGlobalFilter }) => (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              className="w-full bg-white sm:max-w-xs"
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Search appointments"
            />

            <NativeSelect
              className="w-full bg-white sm:w-48"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter appointment status"
            >
              {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
      />
    </div>
  );
}
