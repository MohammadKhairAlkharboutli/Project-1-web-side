import {
  RATING_SCORE_OPTIONS,
  RATING_STATUS_OPTIONS,
} from "@/components/shared/Ratings/ratingUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import AsyncAppointmentEntityFilter from "@/pages/Admin/Appointments/components/AsyncAppointmentEntityFilter";

export default function RatingsToolbar({
  globalFilter,
  setGlobalFilter,
  selectedDoctor,
  setSelectedDoctor,
  loadDoctorOptions,
  selectedPatient,
  setSelectedPatient,
  loadPatientOptions,
  scoreFilter,
  setScoreFilter,
  statusFilter,
  setStatusFilter,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <Input
        appearance="filter"
        placeholder="Search ratings, doctors, patients..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <AsyncAppointmentEntityFilter
          label="Doctor"
          selectedOption={selectedDoctor}
          onSelect={setSelectedDoctor}
          loadOptions={loadDoctorOptions}
        />
        <AsyncAppointmentEntityFilter
          label="Patient"
          selectedOption={selectedPatient}
          onSelect={setSelectedPatient}
          loadOptions={loadPatientOptions}
        />

        <NativeSelect
          appearance="filter"
          className="w-full sm:w-44"
          value={scoreFilter}
          onChange={(event) => setScoreFilter(event.target.value)}
        >
          {RATING_SCORE_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          appearance="filter"
          className="w-full sm:w-40"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
          }}
        >
          {RATING_STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Button variant="outline" appearance="filter" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
