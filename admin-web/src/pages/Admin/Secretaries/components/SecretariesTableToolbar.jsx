import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function SecretariesTableToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        appearance="filter"
        placeholder="Search secretaries..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
        <NativeSelect
          appearance="filter"
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
          appearance="filter"
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

        <Button type="button" variant="outline" appearance="filter" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
