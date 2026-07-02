import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function SecretariesTableToolbar({
  table,
  globalFilter,
  setGlobalFilter,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search secretaries..."
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
          value={table.getColumn("clinic")?.getFilterValue() ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("clinic")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <NativeSelectOption value="all">All clinics</NativeSelectOption>
          <NativeSelectOption value="Downtown Clinic">
            Downtown Clinic
          </NativeSelectOption>
          <NativeSelectOption value="Westside Clinic">
            Westside Clinic
          </NativeSelectOption>
          <NativeSelectOption value="Lakeside Clinic">
            Lakeside Clinic
          </NativeSelectOption>
          <NativeSelectOption value="Bayview Clinic">
            Bayview Clinic
          </NativeSelectOption>
          <NativeSelectOption value="Greenfield Clinic">
            Greenfield Clinic
          </NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
}
