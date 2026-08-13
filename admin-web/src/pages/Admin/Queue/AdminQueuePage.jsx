import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";

import { AlertCircle } from "lucide-react";

import { appointmentsApi } from "@/api/appointmentsApi";
import { clinicsApi } from "@/api/clinicsApi";
import { doctorsApi } from "@/api/doctorsApi";
import { queueApi } from "@/api/queueApi";
import DataTable from "@/components/shared/DataTable";

import {
  getActiveQueueColumns,
  getHistoryQueueColumns,
} from "./AdminQueueColumns";
import AdminQueueToolbar from "./AdminQueueToolbar";
import CheckInCandidates from "./CheckInCandidates";
import MoveQueueDialog from "./MoveQueueDialog";
import SkipQueueDialog from "./SkipQueueDialog";
import {
  QUEUE_STATUS,
  getPatientNameFromAppointment,
  isActiveQueueItem,
  isHistoryQueueItem,
  sortQueueByPosition,
} from "./queueUtils";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function AdminQueuePage() {
  const [searchParams] = useSearchParams();
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [queueItems, setQueueItems] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedClinicId, setSelectedClinicId] = useState(
    searchParams.get("clinicId") ?? "",
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    searchParams.get("doctorId") ?? "",
  );
  const [selectedView, setSelectedView] = useState("active");
  const [candidateSearch, setCandidateSearch] = useState("");

  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [queueError, setQueueError] = useState("");

  const [moveItem, setMoveItem] = useState(null);
  const [skipItem, setSkipItem] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const loadDeskData = useCallback(async () => {
    if (!selectedClinicId || !selectedDoctorId) {
      setQueueItems([]);
      setAppointments([]);
      return;
    }

    setLoadingQueue(true);
    setLoadingAppointments(true);
    setQueueError("");

    try {
      const [queueData, appointmentData] = await Promise.all([
        queueApi.getAdminLiveQueue({
          clinicId: selectedClinicId,
          doctorId: selectedDoctorId,
        }),
        appointmentsApi.getAdminAppointments({
          clinicId: selectedClinicId,
          doctorId: selectedDoctorId,
          status: "confirmed",
          from: today,
          to: today,
          limit: 100,
        }),
      ]);

      setQueueItems(Array.isArray(queueData) ? queueData : []);
      setAppointments(appointmentData.data);
    } catch (error) {
      setQueueError(getErrorMessage(error, "Could not load the queue desk."));
    } finally {
      setLoadingQueue(false);
      setLoadingAppointments(false);
    }
  }, [selectedClinicId, selectedDoctorId, today]);

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
  }, [selectedClinicId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDeskData, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDeskData]);

  useEffect(() => {
    if (!selectedClinicId || !selectedDoctorId) {
      return undefined;
    }

    const intervalId = window.setInterval(loadDeskData, 10000);
    return () => window.clearInterval(intervalId);
  }, [loadDeskData, selectedClinicId, selectedDoctorId]);

  const checkInCandidates = useMemo(() => {
    const normalizedSearch = candidateSearch.trim().toLowerCase();

    return appointments
      .filter((appointment) => !appointment.checkinTime && !appointment.queue)
      .filter((appointment) => {
        if (!normalizedSearch) {
          return true;
        }

        return getPatientNameFromAppointment(appointment)
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((left, right) => String(left.startTime).localeCompare(String(right.startTime)));
  }, [appointments, candidateSearch]);

  const displayedQueueItems = useMemo(() => {
    const filteredItems =
      selectedView === "active"
        ? queueItems.filter(isActiveQueueItem)
        : queueItems.filter(isHistoryQueueItem);

    return sortQueueByPosition(filteredItems);
  }, [queueItems, selectedView]);

  const waitingPositions = useMemo(
    () =>
      queueItems
        .filter((queueItem) => queueItem.status === QUEUE_STATUS.WAITING)
        .map((queueItem) => Number(queueItem.position))
        .sort((left, right) => left - right),
    [queueItems],
  );

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
    setCandidateSearch("");
    setQueueItems([]);
    setAppointments([]);
    setQueueError("");
  }

  function handleDoctorChange(doctorId) {
    setSelectedDoctorId(doctorId);
    setCandidateSearch("");
    setQueueItems([]);
    setAppointments([]);
    setQueueError("");
  }

  async function handleCheckIn(appointment) {
    setCheckingInId(appointment.id);
    setActionError("");

    try {
      await queueApi.checkInPatient(appointment.id);
      await loadDeskData();
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not check in this patient."));
    } finally {
      setCheckingInId(null);
    }
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
      await loadDeskData();
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
      await loadDeskData();
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not skip patient."));
    } finally {
      setSubmittingAction(false);
    }
  }

  const queueEmptyMessage = !selectedClinicId
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
          Queue desk
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Check in today&apos;s patients and manage the live queue for one doctor at a time.
        </p>
      </div>

      <AdminQueueToolbar
        clinics={clinics}
        doctors={doctors}
        selectedClinicId={selectedClinicId}
        selectedDoctorId={selectedDoctorId}
        selectedView={selectedView}
        loading={loadingQueue || loadingAppointments}
        loadingLookups={loadingLookups || loadingDoctors}
        onClinicChange={handleClinicChange}
        onDoctorChange={handleDoctorChange}
        onViewChange={setSelectedView}
        onRefresh={loadDeskData}
      />

      {(lookupError || queueError || actionError) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{lookupError || queueError || actionError}</span>
        </div>
      )}

      <CheckInCandidates
        appointments={checkInCandidates}
        searchTerm={candidateSearch}
        loading={loadingAppointments}
        checkingInId={checkingInId}
        selectedClinicId={selectedClinicId}
        selectedDoctorId={selectedDoctorId}
        onSearchChange={setCandidateSearch}
        onCheckIn={handleCheckIn}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Live queue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Queue positions are shown together—there are no pages to click through.
          </p>
        </div>
        <DataTable
          columns={columns}
          data={displayedQueueItems}
          emptyMessage={queueEmptyMessage}
          pagination={false}
          sorting={false}
          rowClassName="h-16"
        />
      </section>

      {moveItem && (
        <MoveQueueDialog
          queueItem={moveItem}
          availablePositions={waitingPositions}
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
