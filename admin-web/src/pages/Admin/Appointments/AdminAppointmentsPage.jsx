import { useMemo, useState } from "react";

import DataTable from "@/components/shared/DataTable";
import {
  filterAppointmentsByDate,
  getUniqueAppointmentsById,
} from "@/components/shared/Appointments/appointmentFilters";
import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";

import { getAdminAppointmentColumns } from "./components/AdminAppointmentColumns";
import AdminAppointmentsToolbar from "./components/AdminAppointmentsToolbar";

export default function AdminAppointmentsPage() {
  const [dateRange, setDateRange] = useState("all");
  const [exactDate, setExactDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [selectedClinicId, setSelectedClinicId] = useState("all");

  const appointments = useMemo(() => {
    const entityFilteredAppointments = mockAppointments.filter((appointment) => {
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
  }, [dateRange, exactDate, selectedClinicId, selectedDoctorId, selectedPatientId]);

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
        emptyMessage="No appointments found."
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
            doctorOptions={getUniqueAppointmentsById(
              mockAppointments,
              "doctorId",
            )}
            patientOptions={getUniqueAppointmentsById(
              mockAppointments,
              "patientId",
            )}
            clinicOptions={getUniqueAppointmentsById(
              mockAppointments,
              "clinicId",
            )}
            onResetFilters={() =>
              resetFilters(toolbarProps.table, toolbarProps.setGlobalFilter)
            }
          />
        )}
      />
    </section>
  );
}
