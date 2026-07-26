import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  APPOINTMENT_STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
  getDoctorDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";

export default function ClinicAppointmentsToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  dateRange,
  setDateRange,
  exactDate,
  setExactDate,
  doctorId,
  setDoctorId,
  doctorOptions,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        placeholder="Search appointments..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
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
          className="w-full sm:w-40"
          value={table.getColumn("status")?.getFilterValue() ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
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
