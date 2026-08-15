import { useCallback, useMemo, useState } from "react";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import { clinicsApi } from "@/api/clinicsApi";
import { doctorsApi } from "@/api/doctorsApi";
import DataTable from "@/components/shared/DataTable";
import { useAdminAppointments } from "@/hooks/useAdminAppointments";

import { getAdminAppointmentColumns } from "./components/AdminAppointmentColumns";
import AdminAppointmentsToolbar from "./components/AdminAppointmentsToolbar";

export default function AdminAppointmentsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const baseFilters = useMemo(
    () => ({
      ...(selectedDoctor ? { doctorId: selectedDoctor.id } : {}),
      ...(selectedPatient ? { patientId: selectedPatient.id } : {}),
      ...(selectedClinic ? { clinicId: selectedClinic.id } : {}),
    }),
    [selectedClinic, selectedDoctor, selectedPatient],
  );
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
    resetFilters: resetAppointmentFilters,
    retryLoad,
  } = useAdminAppointments(baseFilters);

  const loadDoctorOptions = useCallback(
    async (searchTerm) => {
      const response = await doctorsApi.getAdminDoctors({
        page: 1,
        limit: 25,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(selectedClinic ? { clinicId: selectedClinic.id } : {}),
      });

      return response.data.map((doctor) => ({
        id: doctor.id,
        label: doctor.user?.fullName || `Doctor #${doctor.id}`,
        description: doctor.specialization || null,
      }));
    },
    [selectedClinic],
  );

  const loadPatientOptions = useCallback(async (searchTerm) => {
    const response = await adminPatientsApi.getPatients({
      page: 1,
      limit: 25,
      ...(searchTerm ? { search: searchTerm } : {}),
    });

    return response.data.map((patient) => ({
      id: patient.id,
      label: patient.user?.fullName || `Patient #${patient.id}`,
      description: patient.user?.email || patient.user?.phone || null,
    }));
  }, []);

  const loadClinicOptions = useCallback(async (searchTerm) => {
    const response = await clinicsApi.getAdminClinics({
      page: 1,
      limit: 25,
      ...(searchTerm ? { search: searchTerm } : {}),
    });

    return response.data.map((clinic) => ({
      id: Number(clinic.id),
      label: clinic.name || `Clinic #${clinic.id}`,
      description: clinic.location || null,
    }));
  }, []);

  function updateDoctorFilter(option) {
    setSelectedDoctor(option);
    setPage(1);
  }

  function updatePatientFilter(option) {
    setSelectedPatient(option);
    setPage(1);
  }

  function updateClinicFilter(option) {
    setSelectedClinic(option);
    setSelectedDoctor(null);
    setPage(1);
  }

  function resetFilters() {
    resetAppointmentFilters();
    setSelectedDoctor(null);
    setSelectedPatient(null);
    setSelectedClinic(null);
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
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={updateDoctorFilter}
            loadDoctorOptions={loadDoctorOptions}
            selectedPatient={selectedPatient}
            setSelectedPatient={updatePatientFilter}
            loadPatientOptions={loadPatientOptions}
            selectedClinic={selectedClinic}
            setSelectedClinic={updateClinicFilter}
            loadClinicOptions={loadClinicOptions}
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
