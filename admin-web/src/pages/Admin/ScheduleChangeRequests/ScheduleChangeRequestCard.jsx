import { Link } from "react-router-dom";
import { CalendarDays, Clock, Hospital, UserRound } from "lucide-react";

import ScheduleSlotCard from "@/components/shared/DoctorWeeklySchedule/ScheduleSlotCard";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatRequestDate(value) {
  if (!value) {
    return "Request date not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ScheduleChangeRequestCard({
  requestGroup,
  onApprove,
  onReject,
  disabled,
}) {
  const dayName = DAYS_OF_WEEK[requestGroup.dayOfWeek] || "Unknown day";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/80 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Proposed schedule replacement
            </h2>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-slate-400" />
              <Link
                to={`/admin/doctors/${requestGroup.doctor.id}`}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                {requestGroup.doctor.user?.full_name || "Unknown doctor"}
              </Link>
            </span>
            <span className="inline-flex items-center gap-2">
              <Hospital className="h-4 w-4 text-slate-400" />
              <Link
                to={`/admin/clinics/${requestGroup.clinic.id}`}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                {requestGroup.clinic.name}
              </Link>
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {dayName}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Requested {formatRequestDate(requestGroup.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <Button
            className="bg-slate-900 text-white hover:bg-slate-800"
            disabled={disabled}
            onClick={() => onApprove(requestGroup)}
          >
            Accept request
          </Button>
          <Button
            variant="outline"
            className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={disabled}
            onClick={() => onReject(requestGroup)}
          >
            Reject request
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">
            Requested {dayName} slots
          </p>
          <p className="text-xs text-slate-500">
            {requestGroup.slots.length}{" "}
            {requestGroup.slots.length === 1 ? "slot" : "slots"}
          </p>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-3">
            {requestGroup.slots.map((slot) => (
              <div key={slot.id} className="w-72 shrink-0">
                <ScheduleSlotCard
                  slot={{
                    ...slot,
                    dayOfWeek: requestGroup.dayOfWeek,
                    clinicId: requestGroup.clinic.id,
                    clinicName: requestGroup.clinic.name,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
