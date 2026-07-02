import { useMemo, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import {
  filterAppointmentsByDate,
  getUniqueAppointmentsById,
} from "@/components/shared/Appointments/appointmentFilters";
import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";

import { clinics } from "../ClinicData";
import { getClinicAppointmentColumns } from "./components/ClinicAppointmentColumns";
import ClinicAppointmentsToolbar from "./components/ClinicAppointmentsToolbar";

export default function ClinicAppointments() {
  const { clinicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const doctorIdParam = searchParams.get("doctorId");
  const clinic = clinics.find((item) => String(item.id) === clinicId);
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const clinicAppointments = useMemo(
    () =>
      mockAppointments.filter(
        (appointment) => String(appointment.clinicId) === clinicId,
      ),
    [clinicId],
  );

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

  if (!clinic) {
    return null;
  }

  function resetFilters(table, setGlobalFilter) {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    setDateRange("all");
    setExactDate("");
    setSelectedDoctorId("all");
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
        emptyMessage="No appointments found for this clinic."
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
    </div>
  );
}
