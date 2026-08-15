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
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  reasonFilter,
  setReasonFilter,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <Input
        appearance="filter"
        placeholder="Search reports..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <NativeSelect
          appearance="filter"
          className="w-full sm:w-48"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
          }}
        >
          {REPORT_STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          appearance="filter"
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

        <Button variant="outline" appearance="filter" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
