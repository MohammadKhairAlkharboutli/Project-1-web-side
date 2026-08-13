import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import { appointmentsApi } from "@/api/appointmentsApi";
import DataTable from "@/components/shared/DataTable";
import {
  filterAppointmentsByDate,
  getUniqueAppointmentsById,
} from "@/components/shared/Appointments/appointmentFilters";

import { getClinicAppointmentColumns } from "./components/ClinicAppointmentColumns";
import ClinicAppointmentsToolbar from "./components/ClinicAppointmentsToolbar";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this clinic's appointments.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function ClinicAppointments() {
  const { clinic } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const doctorIdParam = searchParams.get("doctorId");
  const [clinicAppointments, setClinicAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadAppointments() {
      try {
        const data = await appointmentsApi.getAdminAppointments({
          clinicId: clinic.id,
        });

        if (isCurrent) {
          setClinicAppointments(data);
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
  }, [clinic.id, loadAttempt]);

  const queryDoctorId = useMemo(() => {
    const hasMatchingDoctor = clinicAppointments.some(
      (appointment) => String(appointment.doctorId) === doctorIdParam,
    );

    return doctorIdParam && hasMatchingDoctor ? doctorIdParam : "all";
  }, [clinicAppointments, doctorIdParam]);

  const activeDoctorId = selectedDoctorId ?? queryDoctorId;

  const appointments = useMemo(() => {
    const doctorFilteredAppointments =
      activeDoctorId === "all"
        ? clinicAppointments
        : clinicAppointments.filter(
            (appointment) => String(appointment.doctorId) === activeDoctorId,
          );

    return filterAppointmentsByDate(
      doctorFilteredAppointments,
      dateRange,
      exactDate,
    );
  }, [activeDoctorId, clinicAppointments, dateRange, exactDate]);

  function handleDoctorChange(doctorId) {
    setSelectedDoctorId(doctorId);

    if (doctorId === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({ doctorId });
  }

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.resetSorting();
    table.setPageIndex(0);
    setDateRange("all");
    setExactDate("");
    setSelectedDoctorId("all");
    setSearchParams({});
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
          Appointments scheduled at this clinic.
        </p>
      </div>

      <DataTable
        columns={getClinicAppointmentColumns()}
        data={appointments}
        emptyMessage={
          isLoading
            ? "Loading appointments..."
            : loadError
              ? "Appointments could not be loaded."
              : "No appointments found for this clinic."
        }
        toolbar={(toolbarProps) => (
          <ClinicAppointmentsToolbar
            {...toolbarProps}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            doctorId={activeDoctorId}
            setDoctorId={handleDoctorChange}
            doctorOptions={getUniqueAppointmentsById(
              clinicAppointments,
              "doctorId",
            )}
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
