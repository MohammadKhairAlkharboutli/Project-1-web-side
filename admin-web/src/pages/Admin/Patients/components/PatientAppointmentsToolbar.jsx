import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  APPOINTMENT_STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
} from "@/components/shared/Appointments/appointmentUtils";

export default function PatientAppointmentsToolbar({
  search,
  setSearch,
  status,
  setStatus,
  dateRange,
  setDateRange,
  exactDate,
  setExactDate,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        placeholder="Search appointments..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
