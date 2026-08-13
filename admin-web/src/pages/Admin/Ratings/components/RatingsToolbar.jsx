import DoctorRatingFilter from "@/components/shared/Ratings/DoctorRatingFilter";
import PatientRatingFilter from "@/components/shared/Ratings/PatientRatingFilter";
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

export default function RatingsToolbar({
  globalFilter,
  setGlobalFilter,
  doctorFilter,
  setDoctorFilter,
  patientFilter,
  setPatientFilter,
  scoreFilter,
  setScoreFilter,
  statusFilter,
  setStatusFilter,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Search ratings..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <DoctorRatingFilter value={doctorFilter} onChange={setDoctorFilter} />
        <PatientRatingFilter value={patientFilter} onChange={setPatientFilter} />

        <NativeSelect
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

        <Button variant="outline" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
