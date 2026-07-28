import { useEffect, useMemo, useState } from "react";

import { appointmentsApi } from "@/api/appointmentsApi";
import DataTable from "@/components/shared/DataTable";
import {
  filterAppointmentsByDate,
  getUniqueAppointmentsById,
} from "@/components/shared/Appointments/appointmentFilters";

import { getAdminAppointmentColumns } from "./components/AdminAppointmentColumns";
import AdminAppointmentsToolbar from "./components/AdminAppointmentsToolbar";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load the appointments. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function AdminAppointmentsPage() {
  const [allAppointments, setAllAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [selectedClinicId, setSelectedClinicId] = useState("all");

  useEffect(() => {
    let isCurrent = true;

    async function loadAppointments() {
      try {
        const data = await appointmentsApi.getAdminAppointments();

        if (isCurrent) {
          setAllAppointments(data);
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
  }, [loadAttempt]);

  const appointments = useMemo(() => {
    const entityFilteredAppointments = allAppointments.filter((appointment) => {
      const matchesDoctor =
        selectedDoctorId === "all" ||
        String(appointment.doctorId) === selectedDoctorId;
      const matchesPatient =
        selectedPatientId === "all" ||
        String(appointment.patientId) === selectedPatientId;
      const matchesClinic =
        selectedClinicId === "all" ||
        String(appointment.clinicId) === selectedClinicId;

      return matchesDoctor && matchesPatient && matchesClinic;
    });

    return filterAppointmentsByDate(
      entityFilteredAppointments,
      dateRange,
      exactDate,
    );
  }, [allAppointments, dateRange, exactDate, selectedClinicId, selectedDoctorId, selectedPatientId]);

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setDateRange("all");
    setExactDate("");
    setSelectedDoctorId("all");
    setSelectedPatientId("all");
    setSelectedClinicId("all");
  }

  function retryLoad() {
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Appointments
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          All appointments across clinics, doctors, and patients.
        </p>
      </div>

      <DataTable
        columns={getAdminAppointmentColumns()}
        data={appointments}
        emptyMessage={
          isLoading
            ? "Loading appointments..."
            : loadError
              ? "Appointments could not be loaded."
              : "No appointments found."
        }
        toolbar={(toolbarProps) => (
          <AdminAppointmentsToolbar
            {...toolbarProps}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            doctorId={selectedDoctorId}
            setDoctorId={setSelectedDoctorId}
            patientId={selectedPatientId}
            setPatientId={setSelectedPatientId}
            clinicId={selectedClinicId}
            setClinicId={setSelectedClinicId}
            doctorOptions={getUniqueAppointmentsById(allAppointments, "doctorId")}
            patientOptions={getUniqueAppointmentsById(allAppointments, "patientId")}
            clinicOptions={getUniqueAppointmentsById(allAppointments, "clinicId")}
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
    </section>
  );
}
