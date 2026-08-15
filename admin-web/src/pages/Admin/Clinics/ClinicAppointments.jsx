import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import { doctorsApi } from "@/api/doctorsApi";
import DataTable from "@/components/shared/DataTable";
import ProfileAppointmentsToolbar from "@/components/shared/Appointments/ProfileAppointmentsToolbar";
import { useAdminAppointments } from "@/hooks/useAdminAppointments";

import { getClinicAppointmentColumns } from "./components/ClinicAppointmentColumns";
import AsyncAppointmentEntityFilter from "../Appointments/components/AsyncAppointmentEntityFilter";

function getDoctorOption(doctor) {
  const name =
    doctor?.user?.fullName ||
    doctor?.user?.full_name ||
    [doctor?.user?.firstName, doctor?.user?.fatherName, doctor?.user?.lastName]
      .filter(Boolean)
      .join(" ");

  return {
    id: Number(doctor?.id),
    label: name || `Doctor #${doctor?.id}`,
    description: doctor?.specialization || null,
  };
}

export default function ClinicAppointments() {
  const { clinic } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const doctorIdParam = searchParams.get("doctorId");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const activeSelectedDoctor =
    doctorIdParam && Number(selectedDoctor?.id) === Number(doctorIdParam)
      ? selectedDoctor
      : doctorIdParam
        ? {
            id: Number(doctorIdParam),
            label: `Doctor #${doctorIdParam}`,
            description: null,
          }
        : null;
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

  useEffect(() => {
    if (!doctorIdParam) {
      return undefined;
    }

    let isCurrent = true;

    async function loadSelectedDoctor() {
      try {
        const doctor = await doctorsApi.getDoctor(doctorIdParam);

        if (isCurrent) {
          setSelectedDoctor(getDoctorOption(doctor));
        }
      } catch {
        if (isCurrent) {
          setSelectedDoctor({
            id: Number(doctorIdParam),
            label: `Doctor #${doctorIdParam}`,
            description: null,
          });
        }
      }
    }

    loadSelectedDoctor();

    return () => {
      isCurrent = false;
    };
  }, [doctorIdParam]);

  const loadDoctorOptions = useCallback(
    async (searchTerm) => {
      const response = await doctorsApi.getAdminDoctors({
        page: 1,
        limit: 25,
        clinicId: clinic.id,
        ...(searchTerm ? { search: searchTerm } : {}),
      });

      return response.data.map(getDoctorOption);
    },
    [clinic.id],
  );

  function handleDoctorChange(option) {
    setSelectedDoctor(option);
    setPage(1);

    const nextParams = new URLSearchParams(searchParams);

    if (option) {
      nextParams.set("doctorId", String(option.id));
    } else {
      nextParams.delete("doctorId");
    }

    setSearchParams(nextParams);
  }

  function resetFilters() {
    resetAppointmentFilters();
    setSelectedDoctor(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("doctorId");
    setSearchParams(nextParams);
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
            leadingFilters={
              <AsyncAppointmentEntityFilter
                label="Doctor"
                selectedOption={activeSelectedDoctor}
                onSelect={handleDoctorChange}
                loadOptions={loadDoctorOptions}
              />
            }
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
