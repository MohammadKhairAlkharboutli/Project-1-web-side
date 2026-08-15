import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarDays, CalendarOff, Clock3, LoaderCircle, RefreshCw } from "lucide-react";

import { doctorLeavesApi } from "@/api/doctorLeavesApi";
import { Button } from "@/components/ui/button";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load this doctor's leave records.";

  return Array.isArray(message) ? message.join(" ") : message;
}

function getDate(value) {
  const dateOnly = String(value || "").slice(0, 10);
  return dateOnly ? new Date(`${dateOnly}T00:00:00`) : null;
}

function formatDate(value) {
  const date = getDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return String(value || "Not recorded").slice(0, 10);
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function formatTime(value) {
  return String(value || "").slice(0, 5);
}

function getLeaveTiming(leave) {
  const date = getDate(leave.exceptionDate);

  if (!date || Number.isNaN(date.getTime())) {
    return "past";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return "today";
  }

  return date > today ? "upcoming" : "past";
}

function timingLabel(timing) {
  if (timing === "today") {
    return "Today";
  }

  return timing === "upcoming" ? "Upcoming" : "Past";
}

function timingClassName(timing) {
  if (timing === "today") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return timing === "upcoming"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

export default function AdminDoctorLeaves() {
  const { doctor } = useOutletContext();
  const [leaves, setLeaves] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadLeaves() {
      setLoadState("loading");
      setLoadError("");

      try {
        const data = await doctorLeavesApi.getAdminLeaves({
          doctorProfileId: doctor.id,
        });

        if (isCurrent) {
          setLeaves(data);
          setLoadState("ready");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
          setLoadState("error");
        }
      }
    }

    loadLeaves();

    return () => {
      isCurrent = false;
    };
  }, [doctor.id, loadAttempt]);

  const sortedLeaves = useMemo(() => {
    return [...leaves].sort((first, second) => {
      const firstDate = getDate(first.exceptionDate)?.getTime() ?? 0;
      const secondDate = getDate(second.exceptionDate)?.getTime() ?? 0;
      const firstTiming = getLeaveTiming(first);
      const secondTiming = getLeaveTiming(second);
      const timingOrder = { today: 0, upcoming: 1, past: 2 };

      if (timingOrder[firstTiming] !== timingOrder[secondTiming]) {
        return timingOrder[firstTiming] - timingOrder[secondTiming];
      }

      return firstTiming === "past"
        ? secondDate - firstDate
        : firstDate - secondDate;
    });
  }, [leaves]);

  const upcomingCount = useMemo(
    () => leaves.filter((leave) => getLeaveTiming(leave) !== "past").length,
    [leaves],
  );

  const partialCount = useMemo(
    () => leaves.filter((leave) => leave.startTime && leave.endTime).length,
    [leaves],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Leaves & time off
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Review the dates and hours when this doctor is unavailable. Leave
            records may affect appointment availability.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loadState === "loading"}
          onClick={() => setLoadAttempt((attempt) => attempt + 1)}
        >
          <RefreshCw
            className={loadState === "loading" ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </header>

      {loadState === "loading" ? (
        <section className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-14 text-sm text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading leave records...
        </section>
      ) : null}

      {loadState === "error" ? (
        <section
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          role="alert"
        >
          <p>{loadError}</p>
          <Button
            className="mt-4"
            variant="outline"
            size="sm"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          >
            Try again
          </Button>
        </section>
      ) : null}

      {loadState === "ready" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total records
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {leaves.length}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Today & upcoming
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800">
                {upcomingCount}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Partial-day records
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-800">
                {partialCount}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {sortedLeaves.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Availability</th>
                      <th className="px-5 py-3 font-medium">Time off</th>
                      <th className="px-5 py-3 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedLeaves.map((leave) => {
                      const timing = getLeaveTiming(leave);
                      const isPartial = Boolean(leave.startTime && leave.endTime);

                      return (
                        <tr key={leave.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-4 font-medium text-slate-900">
                            <span className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              {formatDate(leave.exceptionDate)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${timingClassName(timing)}`}
                            >
                              {timingLabel(timing)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {isPartial ? (
                              <span className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-slate-400" />
                                {formatTime(leave.startTime)}–{formatTime(leave.endTime)}
                              </span>
                            ) : (
                              "Full day"
                            )}
                          </td>
                          <td className="max-w-sm px-5 py-4 text-slate-600">
                            {leave.reason || "No reason provided"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <CalendarOff className="mx-auto h-8 w-8 text-slate-300" />
                <h3 className="mt-3 font-medium text-slate-800">
                  No leave records
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  This doctor has no recorded full-day or partial-day time off.
                </p>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
