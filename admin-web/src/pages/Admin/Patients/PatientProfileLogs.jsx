import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { sharedEmptyStateShell } from "@/components/shared/styles";

import { patients } from "../PatientData";
import MedicalProfileLogEvent from "./components/MedicalProfileLogEvent";

function getLogTimestamp(log) {
  const rawValue = log?.createdAt || log?.created_at;
  const date = rawValue ? new Date(rawValue) : null;

  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function getGroupKey(log) {
  return [
    log?.createdAt || log?.created_at || "",
    log?.changedBy?.id || log?.userId || "",
    log?.appointmentId || "",
    log?.changeReason || "",
  ].join("|");
}

function groupProfileLogs(logs) {
  const groups = logs.reduce((groupMap, log) => {
    const groupKey = getGroupKey(log);
    const existingGroup = groupMap.get(groupKey);
    const changedBy = log.changedBy || {
      id: log.user?.id || log.userId,
      role: log.user?.role,
      fullName: log.user?.fullName,
    };

    if (existingGroup) {
      existingGroup.logs.push(log);
      return groupMap;
    }

    groupMap.set(groupKey, {
      id: groupKey,
      createdAt: log.createdAt || log.created_at,
      changedBy,
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

export default function PatientProfileLogs() {
  const { patientId } = useParams();
  const patient = patients.find((item) => String(item.id) === patientId);

  const groupedLogs = useMemo(() => {
    return groupProfileLogs(patient?.medicalProfileLogs || []);
  }, [patient]);

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Medical Profile Change Log
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tracks changes made to the patient's permanent medical profile.
        </p>
      </div>

      {groupedLogs.length > 0 ? (
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
