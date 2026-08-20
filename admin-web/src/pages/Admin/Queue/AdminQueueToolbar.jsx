import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { getDoctorDisplayName } from "./queueUtils";

export default function AdminQueueToolbar({
  clinics,
  doctors,
  selectedClinicId,
  selectedDoctorId,
  loading,
  loadingLookups,
  onClinicChange,
  onDoctorChange,
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
