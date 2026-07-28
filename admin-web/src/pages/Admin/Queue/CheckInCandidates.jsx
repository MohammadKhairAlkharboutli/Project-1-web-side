import { Search, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  formatAppointmentTimeRange,
  getPatientNameFromAppointment,
} from "./queueUtils";

export default function CheckInCandidates({
  appointments,
  searchTerm,
  loading,
  checkingInId,
  selectedClinicId,
  selectedDoctorId,
  onSearchChange,
  onCheckIn,
}) {
  const isSelectionComplete = selectedClinicId && selectedDoctorId;
  const emptyMessage = !isSelectionComplete
    ? "Select a clinic and doctor to see today's appointments."
    : loading
      ? "Loading today's appointments..."
      : searchTerm
        ? "No unchecked-in appointments match your search."
        : "Every scheduled patient has been checked in.";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Today&apos;s appointments
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Check in confirmed patients when they arrive.
          </p>
        </div>

        <label className="relative block w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search patient"
            className="pl-9"
            disabled={!isSelectionComplete}
          />
        </label>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white shadow-[0_1px_0_0_rgb(226_232_240)]">
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Appointment</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length ? (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium text-slate-900">
                    {getPatientNameFromAppointment(appointment)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatAppointmentTimeRange(appointment)}
                  </TableCell>
                  <TableCell className="capitalize text-slate-600">
                    {appointment.type || "—"}
                  </TableCell>
                  <TableCell>
                    {String(appointment.priority) === "2" ? (
                      <span className="font-medium text-red-700">Priority</span>
                    ) : (
                      <span className="text-slate-500">Normal</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onCheckIn(appointment)}
                      disabled={checkingInId === appointment.id}
                    >
                      <UserCheck className="h-4 w-4" />
                      {checkingInId === appointment.id ? "Checking in..." : "Check in"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
