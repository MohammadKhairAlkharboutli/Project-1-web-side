import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function ClinicsTableToolbar({
  globalFilter,
  setGlobalFilter,
  status,
  setStatus,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        appearance="filter"
        placeholder="Search clinics, locations..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
        <NativeSelect
          appearance="filter"
          className="w-[180px]"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
          <NativeSelectOption value="maintenance">Maintenance</NativeSelectOption>
          <NativeSelectOption value="closed">Closed</NativeSelectOption>
        </NativeSelect>

        <Button type="button" variant="outline" appearance="filter" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
