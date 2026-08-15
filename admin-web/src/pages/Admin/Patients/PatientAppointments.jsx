import { useOutletContext } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import ProfileAppointmentsToolbar from "@/components/shared/Appointments/ProfileAppointmentsToolbar";
import { Button } from "@/components/ui/button";
import { useAdminAppointments } from "@/hooks/useAdminAppointments";

import { getPatientAppointmentColumns } from "./components/PatientAppointmentColumns";

export default function PatientAppointments() {
  const { patient } = useOutletContext();
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
  } = useAdminAppointments({ patientId: patient.id });

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
              : "No appointments found for this patient."
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
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retryLoad}
          >
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
