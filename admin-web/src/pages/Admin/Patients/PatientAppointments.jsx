import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { appointmentsApi } from "@/api/appointmentsApi";
import DataTable from "@/components/shared/DataTable";
import { filterAppointmentsByDate } from "@/components/shared/Appointments/appointmentFilters";

import { getPatientAppointmentColumns } from "./components/PatientAppointmentColumns";
import PatientAppointmentsToolbar from "./components/PatientAppointmentsToolbar";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this patient's appointments.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function PatientAppointments() {
  const { patientId } = useParams();
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadAppointments() {
      try {
        const data = await appointmentsApi.getAdminAppointments({ patientId });

        if (isCurrent) {
          setPatientAppointments(data);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, patientId]);

  const appointments = useMemo(
    () => filterAppointmentsByDate(patientAppointments, dateRange, exactDate),
    [dateRange, exactDate, patientAppointments],
  );

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setDateRange("all");
    setExactDate("");
  }

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
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
        emptyMessage={
          isLoading
            ? "Loading appointments..."
            : loadError
              ? "Appointments could not be loaded."
              : "No appointments found for this patient."
        }
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

      {loadError ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{loadError}</span>
          <button type="button" className="font-medium underline" onClick={retryLoad}>
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
