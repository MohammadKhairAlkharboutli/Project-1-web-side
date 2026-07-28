import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { doctorSchedulesApi } from "@/api/doctorSchedulesApi";
import { Button } from "@/components/ui/button";
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

import ScheduleChangeRequestCard from "./ScheduleChangeRequestCard";

function getGroupKey(request) {
  return [request.doctorProfileId, request.clinicId, request.dayOfWeek].join("-");
}

function sortByStartTime(firstSlot, secondSlot) {
  return String(firstSlot.startTime ?? "").localeCompare(
    String(secondSlot.startTime ?? ""),
  );
}

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function buildRequestGroups(requests) {
  const groupsByKey = new Map();

  requests.filter((request) => request.status === "PENDING").forEach((request) => {
    const groupKey = getGroupKey(request);
    const currentGroup = groupsByKey.get(groupKey);

    if (currentGroup) {
      currentGroup.slots.push(request);
      return;
    }

    groupsByKey.set(groupKey, {
      key: groupKey,
      doctor: request.doctorProfile || {
        id: request.doctorProfileId,
        user: { full_name: "Unknown doctor" },
      },
      clinic: request.clinic || { id: request.clinicId, name: "Unknown clinic" },
      dayOfWeek: request.dayOfWeek,
      createdAt: request.createdAt ?? request.created_at,
      slots: [request],
    });
  });

  return Array.from(groupsByKey.values()).map((group) => ({
    ...group,
    slots: [...group.slots].sort(sortByStartTime),
  }));
}

export default function ScheduleChangeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [decision, setDecision] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setRequests(await doctorSchedulesApi.getPendingScheduleRequests());
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load schedule change requests."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadRequests, 0);
    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  const requestGroups = useMemo(() => buildRequestGroups(requests), [requests]);
  const isApproveDecision = decision?.type === "approve";

  async function confirmDecision() {
    if (!decision?.group || isSubmitting) return;

    setIsSubmitting(true);
    setActionError("");
    try {
      if (isApproveDecision) {
        await doctorSchedulesApi.updateScheduleRequestStatus(
          decision.group.slots[0].id,
          "APPROVED",
        );
      } else {
        await Promise.all(
          decision.group.slots.map((slot) =>
            doctorSchedulesApi.updateScheduleRequestStatus(slot.id, "REJECTED"),
          ),
        );
      }
      setDecision(null);
      await loadRequests();
    } catch (error) {
      setActionError(getErrorMessage(error, "Unable to update this schedule request."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Schedule Change Requests</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Review proposed replacements for one doctor, one clinic, and one day at a time.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
          {requestGroups.length} pending {requestGroups.length === 1 ? "request" : "requests"}
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{loadError}</p><Button className="mt-3" variant="outline" onClick={loadRequests}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">Loading schedule change requests…</div>
      ) : requestGroups.length ? (
        <div className="space-y-4">
          {requestGroups.map((requestGroup) => (
            <ScheduleChangeRequestCard key={requestGroup.key} requestGroup={requestGroup} disabled={isSubmitting}
              onApprove={(group) => { setActionError(""); setDecision({ type: "approve", group }); }}
              onReject={(group) => { setActionError(""); setDecision({ type: "reject", group }); }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">There are no pending schedule change requests.</p>
        </div>
      )}

      <AlertDialog open={Boolean(decision)} onOpenChange={(open) => { if (!open && !isSubmitting) setDecision(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia><AlertTriangle className="h-5 w-5" /></AlertDialogMedia>
            <AlertDialogTitle>{isApproveDecision ? "Accept schedule change request?" : "Reject schedule change request?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isApproveDecision ? "This applies every pending requested slot in this doctor, clinic, and day group." : "This rejects every pending requested slot in this doctor, clinic, and day group."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant={isApproveDecision ? "default" : "destructive"} disabled={isSubmitting} onClick={(event) => { event.preventDefault(); confirmDecision(); }}>
              {isSubmitting ? "Saving…" : isApproveDecision ? "Accept request" : "Reject request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
