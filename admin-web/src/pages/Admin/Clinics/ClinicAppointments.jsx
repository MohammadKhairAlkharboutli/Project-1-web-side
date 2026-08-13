import { useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import { getUniqueAppointmentsById } from "@/components/shared/Appointments/appointmentFilters";
import { useAdminAppointments } from "@/hooks/useAdminAppointments";

import { getClinicAppointmentColumns } from "./components/ClinicAppointmentColumns";
import ClinicAppointmentsToolbar from "./components/ClinicAppointmentsToolbar";

export default function ClinicAppointments() {
  const { clinic } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const doctorIdParam = searchParams.get("doctorId");
  const activeDoctorId = doctorIdParam ?? "all";
  const baseFilters = useMemo(
    () => ({
      clinicId: clinic.id,
      ...(doctorIdParam ? { doctorId: doctorIdParam } : {}),
    }),
    [clinic.id, doctorIdParam],
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

  function handleDoctorChange(doctorId) {
    setPage(1);

    if (doctorId === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({ doctorId });
  }

  function resetFilters() {
    resetAppointmentFilters();
    setSearchParams({});
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
              : "No appointments found for this clinic."
        }
        toolbar={() => (
          <ClinicAppointmentsToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            doctorId={activeDoctorId}
            setDoctorId={handleDoctorChange}
            doctorOptions={getUniqueAppointmentsById(
              appointments,
              "doctorId",
            )}
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
    </div>
  );
}
