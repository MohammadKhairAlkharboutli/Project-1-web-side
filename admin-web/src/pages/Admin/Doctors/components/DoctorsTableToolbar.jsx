import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function DoctorsTableToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  specializationOptions,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        placeholder="Search doctors..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
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
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
          <NativeSelectOption value="ON_LEAVE">On Leave</NativeSelectOption>
        </NativeSelect>

        <NativeSelect
          className="w-[180px]"
          value={table.getColumn("specialization")?.getFilterValue() ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("specialization")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <NativeSelectOption value="all">
            All specializations
          </NativeSelectOption>
          {specializationOptions.map((specialization) => (
            <NativeSelectOption key={specialization} value={specialization}>
              {specialization}
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
