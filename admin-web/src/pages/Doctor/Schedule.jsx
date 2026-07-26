import { useMemo, useState } from "react";

import DoctorWeeklySchedule from "@/components/shared/DoctorWeeklySchedule/DoctorWeeklySchedule";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { clinics } from "../Admin/ClinicData";
import { getCurrentDoctorScheduleSlots } from "./doctorPortalData";

function getSlotClinicId(slot) {
  return slot.clinicId ?? slot.clinic?.id;
}

export default function DoctorSchedule() {
  const scheduleSlots = getCurrentDoctorScheduleSlots();
  const clinicIds = new Set(
    scheduleSlots
      .map((slot) => getSlotClinicId(slot))
      .filter((clinicId) => clinicId !== undefined && clinicId !== null),
  );
  const clinicOptions = clinics.filter((clinic) => clinicIds.has(clinic.id));
  const [selectedClinicId, setSelectedClinicId] = useState(
    String(clinicOptions[0]?.id ?? ""),
  );

  const selectedClinic = clinicOptions.find(
    (clinic) => String(clinic.id) === selectedClinicId,
  );

  const filteredSlots = useMemo(
    () =>
      selectedClinicId
        ? scheduleSlots.filter(
            (slot) => String(getSlotClinicId(slot)) === selectedClinicId,
          )
        : scheduleSlots,
    [scheduleSlots, selectedClinicId],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Schedule
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review your weekly clinic availability.
          </p>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Clinic
          <NativeSelect
            className="w-full bg-white sm:w-64"
            value={selectedClinicId}
            onChange={(event) => setSelectedClinicId(event.target.value)}
            aria-label="Select clinic schedule"
          >
            {clinicOptions.map((clinic) => (
              <NativeSelectOption key={clinic.id} value={String(clinic.id)}>
                {clinic.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      </div>

      <DoctorWeeklySchedule
        slots={filteredSlots}
        emptyMessage={`No schedule for ${selectedClinic?.name || "this clinic"}.`}
      />
    </div>
  );
}
