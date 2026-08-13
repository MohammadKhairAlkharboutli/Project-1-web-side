import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import DataTable from "@/components/shared/DataTable";
import { appointmentMatchesDateRange } from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";

import { getPatientAppointmentColumns } from "./components/PatientAppointmentColumns";
import PatientAppointmentsToolbar from "./components/PatientAppointmentsToolbar";

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : message || "We could not load the appointments. Please try again.";
}

export default function PatientAppointments() {
  const { patient } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("all");
  const [dateRange, setDateRangeState] = useState("all");
  const [exactDate, setExactDateState] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadAppointments() {
      setIsLoading(true);
      setLoadError("");
      setAppointments([]);

      try {
        const data = await adminPatientsApi.getAppointments(patient.id);

        if (isCurrent) {
          setAppointments(data);
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
  }, [loadAttempt, patient.id]);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const normalizedStatus = String(appointment.status || "").toLowerCase();
        const matchesStatus = status === "all" || normalizedStatus === status;
        const matchesDateRange = appointmentMatchesDateRange(appointment, dateRange);
        const matchesExactDate =
          !exactDate || String(appointment.requestedDate || "").slice(0, 10) === exactDate;

        return matchesStatus && matchesDateRange && matchesExactDate;
      }),
    [appointments, dateRange, exactDate, status],
  );

  function setSearch(value) {
    setSearchState(value);
  }

  function setStatus(value) {
    setStatusState(value);
  }

  function setDateRange(value) {
    setDateRangeState(value);
    setExactDateState("");
  }

  function setExactDate(value) {
    setExactDateState(value);
    setDateRangeState("all");
  }

  function resetFilters() {
    setSearchState("");
    setStatusState("all");
    setDateRangeState("all");
    setExactDateState("");
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
        data={filteredAppointments}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        sorting={false}
        emptyMessage={
          isLoading
            ? "Loading appointments..."
            : loadError
              ? "Appointments could not be loaded."
              : "No appointments found for this patient."
        }
        toolbar={() => (
          <PatientAppointmentsToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            onResetFilters={resetFilters}
          />
        )}
      />

      {loadError ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          >
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
