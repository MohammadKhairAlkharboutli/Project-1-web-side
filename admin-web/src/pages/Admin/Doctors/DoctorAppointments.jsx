import { useOutletContext } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import { getDoctorAppointmentColumns } from "@/components/shared/Appointments/DoctorAppointmentColumns";
import ProfileAppointmentsToolbar from "@/components/shared/Appointments/ProfileAppointmentsToolbar";
import { useAdminAppointments } from "@/hooks/useAdminAppointments";

export default function DoctorAppointments() {
  const { doctor } = useOutletContext();
  const {
    appointments,
    total,
    page,
    limit,
    search,
    status,
    paymentStatus,
    dateRange,
    exactDate,
    isLoading,
    loadError,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setPaymentStatus,
    setDateRange,
    setExactDate,
    resetFilters,
    retryLoad,
  } = useAdminAppointments({ doctorId: doctor.id });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Appointments
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Appointment list for this doctor.
        </p>
      </div>

      <DataTable
        columns={getDoctorAppointmentColumns()}
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
              : "No appointments found for this doctor."
        }
        toolbar={() => (
          <ProfileAppointmentsToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            onResetFilters={resetFilters}
          />
        )}
      />

      {loadError ? (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span>{loadError}</span>
          <button type="button" className="font-medium underline" onClick={retryLoad}>
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
