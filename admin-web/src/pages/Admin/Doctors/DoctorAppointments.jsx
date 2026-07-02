import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import {
  filterAppointmentsByDate,
  getUniqueAppointmentsById,
} from "@/components/shared/Appointments/appointmentFilters";
import { getDoctorAppointmentColumns } from "@/components/shared/Appointments/DoctorAppointmentColumns";
import DoctorAppointmentsToolbar from "@/components/shared/Appointments/DoctorAppointmentsToolbar";
import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";

import { doctors } from "../DoctorData";

export default function DoctorAppointments() {
  const { doctorId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const clinicIdParam = searchParams.get("clinicId");
  const doctor = doctors.find((item) => String(item.id) === doctorId);
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState(null);

  const doctorAppointments = useMemo(
    () =>
      mockAppointments.filter(
      (appointment) => String(appointment.doctorId) === doctorId,
      ),
    [doctorId],
  );

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

  if (!doctor) {
    return null;
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
        emptyMessage="No appointments found for this doctor."
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
    </div>
  );
}
