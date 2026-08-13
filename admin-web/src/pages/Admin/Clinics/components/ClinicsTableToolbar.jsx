import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function ClinicsTableToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  locationOptions,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        placeholder="Search clinics..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
        <NativeSelect
          className="w-[180px]"
          value={table.getColumn("location")?.getFilterValue() ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("location")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <NativeSelectOption value="all">All locations</NativeSelectOption>
          {locationOptions.map((location) => (
            <NativeSelectOption key={location} value={location}>
              {location}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Button type="button" variant="outline" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
