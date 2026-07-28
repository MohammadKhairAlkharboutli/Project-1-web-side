import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import { doctorClinicsApi } from "@/api/doctorClinicsApi";
import { doctorSchedulesApi } from "@/api/doctorSchedulesApi";
import DoctorWeeklySchedule from "@/components/shared/DoctorWeeklySchedule/DoctorWeeklySchedule";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this doctor schedule.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorSchedule() {
  const { doctor } = useOutletContext();
  const [searchParams] = useSearchParams();
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicIdOverride, setSelectedClinicIdOverride] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const requestedClinicId = searchParams.get("clinicId");

  useEffect(() => {
    let isCurrent = true;

    async function loadSchedule() {
      try {
        const [slots, assignedClinics] = await Promise.all([
          doctorSchedulesApi.getAdminDoctorSchedule(doctor.id),
          doctorClinicsApi.getClinicsForDoctor(doctor.id),
        ]);

        if (isCurrent) {
          setScheduleSlots(slots);
          setClinics(assignedClinics);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadSchedule();

    return () => {
      isCurrent = false;
    };
  }, [doctor.id, loadAttempt]);

  const selectedClinicId = clinics.some(
    (clinic) => String(clinic.id) === selectedClinicIdOverride,
  )
    ? selectedClinicIdOverride
    : clinics.some((clinic) => String(clinic.id) === requestedClinicId)
      ? requestedClinicId
      : String(clinics[0]?.id ?? "");

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => String(clinic.id) === selectedClinicId),
    [clinics, selectedClinicId],
  );

  const selectedClinicSchedule = useMemo(
    () =>
      scheduleSlots.filter(
        (slot) => String(slot.clinicId ?? slot.clinic?.id) === selectedClinicId,
      ),
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
            Weekly clinic schedule for this doctor.
          </p>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Clinic
          <NativeSelect
            className="w-full sm:w-64"
            value={selectedClinicId}
            onChange={(event) => setSelectedClinicIdOverride(event.target.value)}
            aria-label="Select clinic schedule"
            disabled={isLoading || clinics.length === 0}
          >
            {clinics.length === 0 ? (
              <NativeSelectOption value="">No assigned clinics</NativeSelectOption>
            ) : (
              clinics.map((clinic) => (
                <NativeSelectOption key={clinic.id} value={String(clinic.id)}>
                  {clinic.name}
                </NativeSelectOption>
              ))
            )}
          </NativeSelect>
        </label>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-2 font-medium underline"
            onClick={() => {
              setIsLoading(true);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <DoctorWeeklySchedule
          slots={selectedClinicSchedule}
          emptyMessage={
            isLoading
              ? "Loading schedule..."
              : `No schedule for ${selectedClinic?.name || "this clinic"}.`
          }
        />
      )}
    </div>
  );
}
