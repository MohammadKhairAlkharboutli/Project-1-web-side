import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import { filterAppointmentsByDate } from "@/components/shared/Appointments/appointmentFilters";
import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";

import { patients } from "../PatientData";
import { getPatientAppointmentColumns } from "./components/PatientAppointmentColumns";
import PatientAppointmentsToolbar from "./components/PatientAppointmentsToolbar";

export default function PatientAppointments() {
  const { patientId } = useParams();
  const patient = patients.find((item) => String(item.id) === patientId);
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");

  const appointments = useMemo(() => {
    const patientAppointments = mockAppointments.filter(
      (appointment) => String(appointment.patientId) === patientId,
    );

    return filterAppointmentsByDate(patientAppointments, dateRange, exactDate);
  }, [dateRange, exactDate, patientId]);

  if (!patient) {
    return null;
  }

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setDateRange("all");
    setExactDate("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Appointments
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Appointment history and scheduled visits for this patient.
        </p>
      </div>

      <DataTable
        columns={getPatientAppointmentColumns()}
        data={appointments}
        emptyMessage="No appointments found for this patient."
        toolbar={(toolbarProps) => (
          <PatientAppointmentsToolbar
            {...toolbarProps}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            onResetFilters={() =>
              resetFilters(toolbarProps.table, toolbarProps.setGlobalFilter)
            }
          />
        )}
      />
    </div>
  );
}
