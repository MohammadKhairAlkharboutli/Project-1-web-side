import {
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_OPTIONS,
} from "@/components/shared/Ratings/ratingUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function RatingReportsToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  reasonFilter,
  setReasonFilter,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Search reports..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <NativeSelect
          className="w-full sm:w-48"
          value={table.getColumn("status")?.getFilterValue() ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          {REPORT_STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          className="w-full sm:w-48"
          value={reasonFilter}
          onChange={(event) => setReasonFilter(event.target.value)}
        >
          {REPORT_REASON_OPTIONS.map((option) => (
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
