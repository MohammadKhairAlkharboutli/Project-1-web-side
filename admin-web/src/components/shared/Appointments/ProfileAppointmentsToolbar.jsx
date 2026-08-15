import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import {
  ADMIN_APPOINTMENT_DATE_RANGE_OPTIONS,
  APPOINTMENT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "./appointmentUtils";

export default function ProfileAppointmentsToolbar({
  search,
  setSearch,
  status,
  setStatus,
  paymentStatus,
  setPaymentStatus,
  dateRange,
  setDateRange,
  exactDate,
  setExactDate,
  leadingFilters,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <Input
        appearance="filter"
        placeholder="Search by appointment ID, patient, doctor, clinic, phone..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        {leadingFilters}

        <NativeSelect
          appearance="filter"
          className="w-full sm:w-40"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {APPOINTMENT_STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          appearance="filter"
          className="w-full sm:w-44"
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value)}
        >
          {PAYMENT_STATUS_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          appearance="filter"
          className="w-full sm:w-40"
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value)}
        >
          {ADMIN_APPOINTMENT_DATE_RANGE_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <label className="w-full text-xs font-medium text-slate-600 sm:w-40">
          Specific date
          <Input
            appearance="filter"
            type="date"
            value={exactDate}
            onChange={(event) => setExactDate(event.target.value)}
            className="mt-1 w-full"
          />
        </label>

        <Button variant="outline" appearance="filter" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
