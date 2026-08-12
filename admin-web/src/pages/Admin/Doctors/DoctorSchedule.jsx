import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { doctorSchedulesApi } from "@/api/doctorSchedulesApi";
import DoctorWeeklySchedule from "@/components/shared/DoctorWeeklySchedule/DoctorWeeklySchedule";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this doctor schedule.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorSchedule() {
  const { doctor } = useOutletContext();
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const assignedClinic = doctor.assignedClinic;

  useEffect(() => {
    let isCurrent = true;

    async function loadSchedule() {
      if (!assignedClinic) {
        if (isCurrent) {
          setScheduleSlots([]);
          setLoadError("");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const slots = await doctorSchedulesApi.getAdminDoctorSchedule(doctor.id);

        if (isCurrent) {
          setScheduleSlots(slots);
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
  }, [assignedClinic, doctor.id, loadAttempt]);

  const clinicSchedule = useMemo(
    () =>
      scheduleSlots.filter(
        (slot) =>
          String(slot.clinicId ?? slot.clinic?.id) === String(assignedClinic?.id),
      ),
    [assignedClinic?.id, scheduleSlots],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Schedule
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Weekly schedule for this doctor at {assignedClinic?.name || "their assigned clinic"}.
        </p>
      </div>

      {!assignedClinic ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This doctor is not assigned to a clinic yet. Assign a clinic from the Overview before managing their schedule.
        </div>
      ) : loadError ? (
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
          slots={clinicSchedule}
          emptyMessage={
            isLoading
              ? "Loading schedule..."
              : `No schedule for ${assignedClinic.name}.`
          }
        />
      )}
    </div>
  );
}
