import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { AlertCircle } from "lucide-react";

import { clinicsApi } from "@/api/clinicsApi";
import { doctorsApi } from "@/api/doctorsApi";
import { queueApi } from "@/api/queueApi";
import DataTable from "@/components/shared/DataTable";

import {
  getActiveQueueColumns,
  getHistoryQueueColumns,
} from "./AdminQueueColumns";
import AdminQueueToolbar from "./AdminQueueToolbar";
import MoveQueueDialog from "./MoveQueueDialog";
import SkipQueueDialog from "./SkipQueueDialog";
import {
  isActiveQueueItem,
  isHistoryQueueItem,
  sortQueueByPosition,
} from "./queueUtils";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function AdminQueuePage() {
  const [searchParams] = useSearchParams();
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [queueItems, setQueueItems] = useState([]);

  const [selectedClinicId, setSelectedClinicId] = useState(
    searchParams.get("clinicId") ?? "",
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    searchParams.get("doctorId") ?? "",
  );
  const [selectedView, setSelectedView] = useState("active");

  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [queueError, setQueueError] = useState("");

  const [moveItem, setMoveItem] = useState(null);
  const [skipItem, setSkipItem] = useState(null);
  const [actionError, setActionError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadQueueForSelection = useCallback(async (clinicId, doctorId) => {
    if (!clinicId || !doctorId) {
      setQueueItems([]);
      return;
    }

    setLoadingQueue(true);
    setQueueError("");

    try {
      const data = await queueApi.getAdminLiveQueue({
        clinicId,
        doctorId,
      });

      setQueueItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setQueueError(getErrorMessage(error, "Could not load queue."));
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadClinics() {
      setLoadingLookups(true);
      setLookupError("");

      try {
        const data = await clinicsApi.getClinics();

        if (isMounted) {
          setClinics(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setLookupError(getErrorMessage(error, "Could not load clinics."));
        }
      } finally {
        if (isMounted) {
          setLoadingLookups(false);
        }
      }
    }

    loadClinics();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDoctors() {
      if (!selectedClinicId) {
        setDoctors([]);
        return;
      }

      setLoadingDoctors(true);
      setLookupError("");

      try {
        const data = await doctorsApi.getDoctors({ clinicId: selectedClinicId });

        if (isMounted) {
          setDoctors(Array.isArray(data) ? data : []);
        }

        if (selectedDoctorId) {
          await loadQueueForSelection(selectedClinicId, selectedDoctorId);
        }
      } catch (error) {
        if (isMounted) {
          setLookupError(getErrorMessage(error, "Could not load doctors."));
          setDoctors([]);
        }
      } finally {
        if (isMounted) {
          setLoadingDoctors(false);
        }
      }
    }

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, [loadQueueForSelection, selectedClinicId, selectedDoctorId]);

  const loadQueue = useCallback(async () => {
    await loadQueueForSelection(selectedClinicId, selectedDoctorId);
  }, [loadQueueForSelection, selectedClinicId, selectedDoctorId]);

  useEffect(() => {
    if (!selectedClinicId || !selectedDoctorId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadQueue();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [loadQueue, selectedClinicId, selectedDoctorId]);

  const displayedQueueItems = useMemo(() => {
    const filteredItems =
      selectedView === "active"
        ? queueItems.filter(isActiveQueueItem)
        : queueItems.filter(isHistoryQueueItem);

    return sortQueueByPosition(filteredItems);
  }, [queueItems, selectedView]);

  const activeColumns = useMemo(
    () =>
      getActiveQueueColumns({
        onMove: (queueItem) => {
          setActionError("");
          setMoveItem(queueItem);
        },
        onSkip: (queueItem) => {
          setActionError("");
          setSkipItem(queueItem);
        },
      }),
    [],
  );

  const historyColumns = useMemo(() => getHistoryQueueColumns(), []);
  const columns = selectedView === "active" ? activeColumns : historyColumns;

  function handleClinicChange(clinicId) {
    setSelectedClinicId(clinicId);
    setSelectedDoctorId("");
    setQueueItems([]);
    setQueueError("");
  }

  function handleDoctorChange(doctorId) {
    setSelectedDoctorId(doctorId);
    setQueueItems([]);
    setQueueError("");
    loadQueueForSelection(selectedClinicId, doctorId);
  }

  async function handleMoveQueue(newPosition) {
    if (!moveItem) {
      return;
    }

    setSubmittingAction(true);
    setActionError("");

    try {
      await queueApi.reorderQueue(moveItem.id, newPosition);
      setMoveItem(null);
      await loadQueue();
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not move queue item."));
    } finally {
      setSubmittingAction(false);
    }
  }

  async function handleSkipQueue() {
    if (!skipItem) {
      return;
    }

    setSubmittingAction(true);
    setActionError("");

    try {
      await queueApi.skipQueue(skipItem.id);
      setSkipItem(null);
      await loadQueue();
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not skip patient."));
    } finally {
      setSubmittingAction(false);
    }
  }

  const emptyMessage = !selectedClinicId
    ? "Select a clinic to view the queue."
    : !selectedDoctorId
      ? "Select a doctor to view the queue."
      : loadingQueue
        ? "Loading queue..."
        : selectedView === "active"
          ? "No active queue entries for this doctor and clinic."
          : "No queue history for this doctor and clinic.";

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Queue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          View today&apos;s queue for one clinic and doctor at a time.
        </p>
      </div>

      <AdminQueueToolbar
        clinics={clinics}
        doctors={doctors}
        selectedClinicId={selectedClinicId}
        selectedDoctorId={selectedDoctorId}
        selectedView={selectedView}
        loading={loadingQueue}
        loadingLookups={loadingLookups || loadingDoctors}
        onClinicChange={handleClinicChange}
        onDoctorChange={handleDoctorChange}
        onViewChange={setSelectedView}
        onRefresh={loadQueue}
      />

      {(lookupError || queueError) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{lookupError || queueError}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={displayedQueueItems}
        emptyMessage={emptyMessage}
        initialPageSize={10}
        rowClassName="h-16"
      />

      {moveItem && (
        <MoveQueueDialog
          queueItem={moveItem}
          open={Boolean(moveItem)}
          submitting={submittingAction}
          error={actionError}
          onOpenChange={(open) => {
            if (!open && !submittingAction) {
              setMoveItem(null);
              setActionError("");
            }
          }}
          onSubmit={handleMoveQueue}
        />
      )}

      <SkipQueueDialog
        queueItem={skipItem}
        open={Boolean(skipItem)}
        submitting={submittingAction}
        error={skipItem ? actionError : ""}
        onOpenChange={(open) => {
          if (!open && !submittingAction) {
            setSkipItem(null);
            setActionError("");
          }
        }}
        onConfirm={handleSkipQueue}
      />
    </section>
  );
}
