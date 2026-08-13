import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { adminPatientsApi } from "@/api/adminPatientsApi";
import { sharedEmptyStateShell } from "@/components/shared/styles";
import { Button } from "@/components/ui/button";

import MedicalProfileLogEvent from "./components/MedicalProfileLogEvent";

function getLogTimestamp(log) {
  const date = log?.createdAt ? new Date(log.createdAt) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function getGroupKey(log) {
  return [
    log?.createdAt || "",
    log?.changedBy?.id || "",
    log?.appointmentId || "",
    log?.changeReason || "",
  ].join("|");
}

function groupProfileLogs(logs) {
  const groups = logs.reduce((groupMap, log) => {
    const groupKey = getGroupKey(log);
    const existingGroup = groupMap.get(groupKey);

    if (existingGroup) {
      existingGroup.logs.push(log);
      return groupMap;
    }

    groupMap.set(groupKey, {
      id: groupKey,
      createdAt: log.createdAt,
      changedBy: log.changedBy,
      appointmentId: log.appointmentId,
      changeReason: log.changeReason,
      logs: [log],
    });

    return groupMap;
  }, new Map());

  return Array.from(groups.values()).sort(
    (firstGroup, secondGroup) =>
      getLogTimestamp(secondGroup) - getLogTimestamp(firstGroup),
  );
}

function isNotFoundError(error) {
  return error?.response?.status === 404;
}

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : message || "We could not load the medical profile changes. Please try again.";
}

export default function PatientProfileLogs() {
  const { patient } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadLogs() {
      setIsLoading(true);
      setLoadError("");
      setLogs([]);

      try {
        const data = await adminPatientsApi.getMedicalProfileLogs(patient.id);

        if (isCurrent) {
          setLogs(data);
        }
      } catch (error) {
        if (isCurrent && !isNotFoundError(error)) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, patient.id]);

  const groupedLogs = useMemo(() => groupProfileLogs(logs), [logs]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Medical Profile Change Log
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tracks changes made to the patient&apos;s permanent medical profile.
        </p>
      </div>

      {isLoading ? (
        <div className={`${sharedEmptyStateShell} p-5`}>
          <p className="text-sm font-medium text-slate-700">
            Loading medical profile changes...
          </p>
        </div>
      ) : loadError ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          >
            Try again
          </Button>
        </div>
      ) : groupedLogs.length > 0 ? (
        <div className="space-y-4">
          {groupedLogs.map((event) => (
            <MedicalProfileLogEvent key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className={`${sharedEmptyStateShell} p-5`}>
          <p className="text-sm font-medium text-slate-700">
            No medical profile changes recorded.
          </p>
        </div>
      )}
    </div>
  );
}
