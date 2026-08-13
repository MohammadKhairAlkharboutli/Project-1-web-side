import { useMemo, useState } from "react";

import DataTable from "@/components/shared/DataTable";
import { getUniqueAppointmentsById } from "@/components/shared/Appointments/appointmentFilters";
import { useAdminAppointments } from "@/hooks/useAdminAppointments";

import { getAdminAppointmentColumns } from "./components/AdminAppointmentColumns";
import AdminAppointmentsToolbar from "./components/AdminAppointmentsToolbar";

export default function AdminAppointmentsPage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [selectedClinicId, setSelectedClinicId] = useState("all");
  const baseFilters = useMemo(
    () => ({
      ...(selectedDoctorId !== "all" ? { doctorId: selectedDoctorId } : {}),
      ...(selectedPatientId !== "all" ? { patientId: selectedPatientId } : {}),
      ...(selectedClinicId !== "all" ? { clinicId: selectedClinicId } : {}),
    }),
    [selectedClinicId, selectedDoctorId, selectedPatientId],
  );
  const {
    appointments,
    total,
    page,
    limit,
    search,
    status,
    dateRange,
    exactDate,
    isLoading,
    loadError,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setDateRange,
    setExactDate,
    resetFilters: resetAppointmentFilters,
    retryLoad,
  } = useAdminAppointments(baseFilters);

  function updateDoctorFilter(value) {
    setSelectedDoctorId(value);
    setPage(1);
  }

  function updatePatientFilter(value) {
    setSelectedPatientId(value);
    setPage(1);
  }

  function updateClinicFilter(value) {
    setSelectedClinicId(value);
    setPage(1);
  }

  function resetFilters() {
    resetAppointmentFilters();
    setSelectedDoctorId("all");
    setSelectedPatientId("all");
    setSelectedClinicId("all");
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
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        serverFiltering
        sorting={false}
        serverPagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage={
          isLoading
            ? "Loading appointments..."
            : loadError
              ? "Appointments could not be loaded."
              : "No appointments found."
        }
        toolbar={() => (
          <AdminAppointmentsToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            doctorId={selectedDoctorId}
            setDoctorId={updateDoctorFilter}
            patientId={selectedPatientId}
            setPatientId={updatePatientFilter}
            clinicId={selectedClinicId}
            setClinicId={updateClinicFilter}
            doctorOptions={getUniqueAppointmentsById(appointments, "doctorId")}
            patientOptions={getUniqueAppointmentsById(appointments, "patientId")}
            clinicOptions={getUniqueAppointmentsById(appointments, "clinicId")}
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
          <button type="button" className="font-medium underline" onClick={retryLoad}>
            Try again
          </button>
        </div>
      ) : null}
    </section>
  );
}
