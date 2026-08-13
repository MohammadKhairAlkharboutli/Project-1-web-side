import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  APPOINTMENT_STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
  getClinicName,
  getDoctorDisplayName,
  getPatientDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";

export default function AdminAppointmentsToolbar({
  search,
  setSearch,
  status,
  setStatus,
  dateRange,
  setDateRange,
  exactDate,
  setExactDate,
  doctorId,
  setDoctorId,
  patientId,
  setPatientId,
  clinicId,
  setClinicId,
  doctorOptions,
  patientOptions,
  clinicOptions,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Search appointments..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <NativeSelect
          className="w-full sm:w-44"
          value={doctorId}
          onChange={(event) => setDoctorId(event.target.value)}
        >
          <NativeSelectOption value="all">All doctors</NativeSelectOption>
          {doctorOptions.map((appointment) => (
            <NativeSelectOption
              key={appointment.doctorId}
              value={String(appointment.doctorId)}
            >
              {getDoctorDisplayName(appointment)}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          className="w-full sm:w-44"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
        >
          <NativeSelectOption value="all">All patients</NativeSelectOption>
          {patientOptions.map((appointment) => (
            <NativeSelectOption
              key={appointment.patientId}
              value={String(appointment.patientId)}
            >
              {getPatientDisplayName(appointment)}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          className="w-full sm:w-44"
          value={clinicId}
          onChange={(event) => setClinicId(event.target.value)}
        >
          <NativeSelectOption value="all">All clinics</NativeSelectOption>
          {clinicOptions.map((appointment) => (
            <NativeSelectOption
              key={appointment.clinicId}
              value={String(appointment.clinicId)}
            >
              {getClinicName(appointment)}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          className="w-full sm:w-40"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {APPOINTMENT_STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          className="w-full sm:w-40"
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value)}
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Input
          type="date"
          value={exactDate}
          onChange={(event) => setExactDate(event.target.value)}
          className="w-full sm:w-40"
          aria-label="Filter by appointment date"
        />

        <Button variant="outline" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
