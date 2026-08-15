import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function DoctorsTableToolbar({
  search,
  setSearch,
  status,
  setStatus,
  clinicId,
  setClinicId,
  clinics,
  isLoadingClinics,
  specialization,
  setSpecialization,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        appearance="filter"
        placeholder="Search doctors..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
        <NativeSelect
          appearance="filter"
          className="w-[150px]"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
        </NativeSelect>

        <NativeSelect
          appearance="filter"
          className="w-[200px]"
          value={clinicId}
          onChange={(event) => setClinicId(event.target.value)}
          disabled={isLoadingClinics}
        >
          <NativeSelectOption value="all">
            {isLoadingClinics ? "Loading clinics..." : "All clinics"}
          </NativeSelectOption>
          {clinics.map((clinic) => (
            <NativeSelectOption key={clinic.id} value={String(clinic.id)}>
              {clinic.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Input
          appearance="filter"
          placeholder="Specialization..."
          value={specialization}
          onChange={(event) => setSpecialization(event.target.value)}
          className="w-[180px]"
          aria-label="Filter by specialization"
        />

        <Button type="button" variant="outline" appearance="filter" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
