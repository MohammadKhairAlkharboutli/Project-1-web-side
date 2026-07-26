import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function ClinicsTableToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  locationOptions,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search clinics..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex gap-2">
        <NativeSelect
          className="w-[160px]"
          value={table.getColumn("status")?.getFilterValue() ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="maintenance">Maintenance</NativeSelectOption>
          <NativeSelectOption value="closed">Closed</NativeSelectOption>
        </NativeSelect>

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
      </div>
    </div>
  );
}
