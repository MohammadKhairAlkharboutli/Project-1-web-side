import { Clock3, ListChecks, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { getDoctorDisplayName } from "./queueUtils";

const VIEW_OPTIONS = [
  {
    value: "active",
    label: "Active",
    description: "Waiting now",
    icon: Clock3,
  },
  {
    value: "history",
    label: "Today’s activity",
    description: "Completed or skipped today",
    icon: ListChecks,
  },
];

export default function AdminQueueToolbar({
  clinics,
  doctors,
  selectedClinicId,
  selectedDoctorId,
  selectedView,
  loading,
  loadingLookups,
  onClinicChange,
  onDoctorChange,
  onViewChange,
  onRefresh,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[220px_220px]">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Clinic</span>
            <NativeSelect
              appearance="filter"
              className="w-full"
              value={selectedClinicId}
              onChange={(event) => onClinicChange(event.target.value)}
              disabled={loadingLookups}
            >
              <NativeSelectOption value="">Select clinic</NativeSelectOption>
              {clinics.map((clinic) => (
                <NativeSelectOption key={clinic.id} value={String(clinic.id)}>
                  {clinic.name || `Clinic #${clinic.id}`}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Doctor</span>
            <NativeSelect
              appearance="filter"
              className="w-full"
              value={selectedDoctorId}
              onChange={(event) => onDoctorChange(event.target.value)}
              disabled={loadingLookups || !selectedClinicId}
            >
              <NativeSelectOption value="">Select doctor</NativeSelectOption>
              {doctors.map((doctor) => (
                <NativeSelectOption key={doctor.id} value={String(doctor.id)}>
                  {getDoctorDisplayName(doctor)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="grid w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 sm:w-auto"
            role="tablist"
            aria-label="Queue view"
          >
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedView === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onViewChange(option.value)}
                  className={`flex min-w-36 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-[var(--color-primary)]" : "text-slate-400"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium leading-4">
                      {option.label}
                    </span>
                    <span className="block text-xs leading-4 text-slate-500">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            appearance="filter"
            onClick={onRefresh}
            disabled={loading || !selectedClinicId || !selectedDoctorId}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
