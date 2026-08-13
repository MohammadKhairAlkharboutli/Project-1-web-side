import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function PatientsTableToolbar({
  search,
  setSearch,
  status,
  setStatus,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        placeholder="Search patients..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
        <NativeSelect
          className="w-[160px]"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
        </NativeSelect>
        <Button type="button" variant="outline" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
