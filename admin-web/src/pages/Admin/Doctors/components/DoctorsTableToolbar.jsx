import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function DoctorsTableToolbar({
  table,
  globalFilter,
  setGlobalFilter,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search doctors..."
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
          <NativeSelectOption value="Active">Active</NativeSelectOption>
          <NativeSelectOption value="Inactive">Inactive</NativeSelectOption>
        </NativeSelect>

        <NativeSelect
          className="w-[180px]"
          value={table.getColumn("specialty")?.getFilterValue() ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("specialty")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <NativeSelectOption value="all">All specialties</NativeSelectOption>
          <NativeSelectOption value="Cardiology">Cardiology</NativeSelectOption>
          <NativeSelectOption value="Dermatology">Dermatology</NativeSelectOption>
          <NativeSelectOption value="Pediatrics">Pediatrics</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
}
