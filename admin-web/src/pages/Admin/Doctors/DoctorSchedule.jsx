import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import DoctorWeeklySchedule from "@/components/shared/DoctorWeeklySchedule/DoctorWeeklySchedule";
import { mockDoctorWeeklyScheduleSlots } from "@/components/shared/DoctorWeeklySchedule/mockScheduleData";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { clinics } from "../ClinicData";
import { doctors } from "../DoctorData";

function getSlotClinicId(slot) {
  return slot.clinicId ?? slot.clinic?.id;
}

function getDefaultClinicId(clinicIdParam) {
  const requestedClinic = clinics.find(
    (clinic) => String(clinic.id) === clinicIdParam,
  );

  if (requestedClinic) {
    return String(requestedClinic.id);
  }

  const scheduledClinicIds = new Set(
    mockDoctorWeeklyScheduleSlots
      .map((slot) => getSlotClinicId(slot))
      .filter((clinicId) => clinicId !== undefined && clinicId !== null),
  );
  const firstScheduledClinic = clinics.find((clinic) =>
    scheduledClinicIds.has(clinic.id),
  );

  return String(firstScheduledClinic?.id ?? clinics[0]?.id ?? "");
}

export default function DoctorSchedule() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const doctor = doctors.find((item) => String(item.id) === doctorId);
  const [selectedClinicId, setSelectedClinicId] = useState(() =>
    getDefaultClinicId(searchParams.get("clinicId")),
  );

  const selectedClinic = clinics.find(
    (clinic) => String(clinic.id) === selectedClinicId,
  );

  const scheduleSlots = useMemo(
    () =>
      mockDoctorWeeklyScheduleSlots.filter(
        (slot) => String(getSlotClinicId(slot)) === selectedClinicId,
      ),
    [selectedClinicId],
  );

  if (!doctor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Schedule
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Weekly clinic schedule for this doctor.
          </p>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Clinic
          <NativeSelect
            className="w-full sm:w-64"
            value={selectedClinicId}
            onChange={(event) => setSelectedClinicId(event.target.value)}
            aria-label="Select clinic schedule"
          >
            {clinics.map((clinic) => (
              <NativeSelectOption key={clinic.id} value={String(clinic.id)}>
                {clinic.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      </div>

      <DoctorWeeklySchedule
        slots={scheduleSlots}
        emptyMessage={`No schedule for ${selectedClinic?.name || "this clinic"}.`}
      />
    </div>
  );
}
