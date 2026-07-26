import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { doctors } from "@/pages/Admin/DoctorData";
import { clinics } from "@/pages/Admin/ClinicData";
import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { mockScheduleChangeRequests } from "./mockScheduleChangeRequests";
import ScheduleChangeRequestCard from "./ScheduleChangeRequestCard";

function getGroupKey(request) {
  return [
    request.doctorProfileId,
    request.clinicId,
    request.dayOfWeek,
  ].join("-");
}

function sortByStartTime(firstSlot, secondSlot) {
  return String(firstSlot.startTime ?? "").localeCompare(
    String(secondSlot.startTime ?? ""),
  );
}

function getAppointmentDayOfWeek(appointment) {
  return new Date(`${appointment.requestedDate}T00:00:00`).getDay();
}

function countAffectedAppointments(group) {
  return mockAppointments.filter((appointment) => {
    const isConfirmed = appointment.status === "confirmed";
    const sameDoctor = Number(appointment.doctorId) === Number(group.doctor.id);
    const sameClinic = Number(appointment.clinicId) === Number(group.clinic.id);
    const sameDay = getAppointmentDayOfWeek(appointment) === group.dayOfWeek;

    return isConfirmed && sameDoctor && sameClinic && sameDay;
  }).length;
}

function buildRequestGroups(requests) {
  const groupsByKey = new Map();

  requests
    .filter((request) => request.status === "PENDING")
    .forEach((request) => {
      const groupKey = getGroupKey(request);
      const currentGroup = groupsByKey.get(groupKey);

      if (currentGroup) {
        currentGroup.slots.push(request);
        return;
      }

      const doctor = doctors.find(
        (item) => Number(item.id) === Number(request.doctorProfileId),
      );
      const clinic = clinics.find(
        (item) => Number(item.id) === Number(request.clinicId),
      );

      groupsByKey.set(groupKey, {
        key: groupKey,
        doctor: doctor || {
          id: request.doctorProfileId,
          user: { full_name: "Unknown doctor" },
        },
        clinic: clinic || {
          id: request.clinicId,
          name: "Unknown clinic",
        },
        doctorProfileId: request.doctorProfileId,
        clinicId: request.clinicId,
        dayOfWeek: request.dayOfWeek,
        createdAt: request.createdAt,
        slots: [request],
      });
    });

  return Array.from(groupsByKey.values()).map((group) => ({
    ...group,
    slots: [...group.slots].sort(sortByStartTime),
    affectedAppointmentsCount: countAffectedAppointments(group),
  }));
}

export default function ScheduleChangeRequestsPage() {
  const [requests, setRequests] = useState(mockScheduleChangeRequests);
  const [decision, setDecision] = useState(null);

  const requestGroups = useMemo(() => buildRequestGroups(requests), [requests]);

  const isApproveDecision = decision?.type === "approve";

  function removeRequestGroup(groupKey) {
    setRequests((current) =>
      current.filter((request) => getGroupKey(request) !== groupKey),
    );
  }

  function confirmDecision() {
    if (!decision?.group) {
      return;
    }

    removeRequestGroup(decision.group.key);
    setDecision(null);
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Schedule Change Requests
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Review proposed replacements for one doctor, one clinic, and one day
            at a time. Accepting a request applies every requested slot in that
            clinic-day group.
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
          {requestGroups.length} pending{" "}
          {requestGroups.length === 1 ? "request" : "requests"}
        </div>
      </div>

      {requestGroups.length ? (
        <div className="space-y-4">
          {requestGroups.map((requestGroup) => (
            <ScheduleChangeRequestCard
              key={requestGroup.key}
              requestGroup={requestGroup}
              onApprove={(group) => setDecision({ type: "approve", group })}
              onReject={(group) => setDecision({ type: "reject", group })}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            There are no pending schedule change requests.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Accepted or rejected mock requests disappear from this page.
          </p>
        </div>
      )}

      <AlertDialog
        open={Boolean(decision)}
        onOpenChange={(open) => {
          if (!open) {
            setDecision(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {isApproveDecision
                ? "Accept schedule change request?"
                : "Reject schedule change request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isApproveDecision
                ? `This will replace the current schedule for this doctor, clinic, and day with the requested slots. ${decision?.group?.affectedAppointmentsCount || 0} confirmed appointments in the mock data may be affected or cancelled when this is connected to backend rules.`
                : "This will reject the proposed clinic-day replacement. The current active schedule will stay unchanged."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={isApproveDecision ? "default" : "destructive"}
              onClick={confirmDecision}
            >
              {isApproveDecision ? "Accept request" : "Reject request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
