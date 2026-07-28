import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import { appointmentsApi } from "@/api/appointmentsApi";
import DataTable from "@/components/shared/DataTable";
import {
  filterAppointmentsByDate,
  getUniqueAppointmentsById,
} from "@/components/shared/Appointments/appointmentFilters";
import { getDoctorAppointmentColumns } from "@/components/shared/Appointments/DoctorAppointmentColumns";
import DoctorAppointmentsToolbar from "@/components/shared/Appointments/DoctorAppointmentsToolbar";
function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this doctor's appointments.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorAppointments() {
  const { doctor } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const clinicIdParam = searchParams.get("clinicId");
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadAppointments() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await appointmentsApi.getAdminAppointments({
          doctorId: doctor.id,
        });

        if (isCurrent) {
          setDoctorAppointments(data);
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
  }, [doctor.id]);

  const queryClinicId = useMemo(() => {
    const hasMatchingClinic = doctorAppointments.some(
      (appointment) => String(appointment.clinicId) === clinicIdParam,
    );

    return clinicIdParam && hasMatchingClinic ? clinicIdParam : "all";
  }, [clinicIdParam, doctorAppointments]);

  const activeClinicId = selectedClinicId ?? queryClinicId;

  const appointments = useMemo(() => {
    const clinicFilteredAppointments =
      activeClinicId === "all"
        ? doctorAppointments
        : doctorAppointments.filter(
            (appointment) => String(appointment.clinicId) === activeClinicId,
          );

    return filterAppointmentsByDate(
      clinicFilteredAppointments,
      dateRange,
      exactDate,
    );
  }, [activeClinicId, dateRange, doctorAppointments, exactDate]);

  function handleClinicChange(clinicId) {
    setSelectedClinicId(clinicId);

    if (clinicId === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({ clinicId });
  }

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setDateRange("all");
    setExactDate("");
    setSelectedClinicId("all");
    setSearchParams({});
  }

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
        emptyMessage={
          isLoading
            ? "Loading appointments..."
            : loadError
              ? "Appointments could not be loaded."
              : "No appointments found for this doctor."
        }
        toolbar={(toolbarProps) => (
          <DoctorAppointmentsToolbar
            {...toolbarProps}
            dateRange={dateRange}
            setDateRange={setDateRange}
            exactDate={exactDate}
            setExactDate={setExactDate}
            clinicId={activeClinicId}
            setClinicId={handleClinicChange}
            clinicOptions={getUniqueAppointmentsById(
              doctorAppointments,
              "clinicId",
            )}
            onResetFilters={() =>
              resetFilters(toolbarProps.table, toolbarProps.setGlobalFilter)
            }
          />
        )}
      />

      {loadError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      ) : null}
    </div>
  );
}
