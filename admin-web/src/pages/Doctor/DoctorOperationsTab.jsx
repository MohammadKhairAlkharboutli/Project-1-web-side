import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
  LoaderCircle,
  Play,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

import { doctorAppointmentsApi, doctorPatientsApi } from "@/api/doctorWorkflowApi";
import { doctorSchedulesApi } from "@/api/doctorSchedulesApi";
import { doctorsApi } from "@/api/doctorsApi";
import { DoctorClinicAssignmentContext } from "@/context/DoctorClinicAssignmentContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const operationSchema = z
  .object({
    patientId: z.string().min(1, "Choose a patient."),
    requestedDate: z.string().min(1, "Choose an operation date."),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid start time."),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid end time."),
    operationCost: z
      .string()
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
        "Enter an operation cost greater than zero.",
      ),
    notes: z
      .string()
      .trim()
      .max(2000, "Notes must be 2,000 characters or fewer.")
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.startTime >= value.endTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time.",
      });
    }
  });

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function dateKey(value) {
  return String(value || "").slice(0, 10);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isToday(value) {
  return dateKey(value) === localDateKey();
}

function patientName(item) {
  const user = item?.patient?.user || item?.user || {};
  return (
    user.full_name ||
    [user.firstName, user.fatherName, user.lastName].filter(Boolean).join(" ") ||
    "Patient"
  );
}

function patientInitials(patient) {
  return (
    patientName(patient)
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P"
  );
}

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Not recorded";
}

function formatTime(value) {
  return String(value || "").slice(0, 5) || "—";
}

function statusLabel(status) {
  return String(status || "").replaceAll("_", " ") || "Unknown";
}

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function isInsideSlot(startTime, endTime, slot) {
  return startTime >= formatTime(slot.startTime) && endTime <= formatTime(slot.endTime);
}

export default function DoctorOperationsTab() {
  const { assignedClinic } = useContext(DoctorClinicAssignmentContext) || {};
  const [state, setState] = useState({
    status: "loading",
    operations: [],
    operationDays: [],
    operationSlots: [],
    doctorId: null,
    error: "",
  });
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchState, setPatientSearchState] = useState({
    status: "idle",
    patients: [],
    error: "",
  });
  const form = useForm({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      patientId: "",
      requestedDate: "",
      startTime: "",
      endTime: "",
      operationCost: "",
      notes: "",
    },
  });

  const loadOperations = useCallback(async () => {
    if (!assignedClinic?.id) {
      setState({
        status: "error",
        operations: [],
        operationDays: [],
        operationSlots: [],
        doctorId: null,
        error: "You must be assigned to a clinic before managing operations.",
      });
      return;
    }

    setState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const [operations, days, schedules, doctor] = await Promise.all([
        doctorAppointmentsApi.getOperations(),
        doctorAppointmentsApi.getOperationDays(assignedClinic.id),
        doctorSchedulesApi.getOwnSchedule(),
        doctorsApi.getOwnProfile(),
      ]);
      const operationSlots = (Array.isArray(schedules) ? schedules : []).filter(
        (slot) =>
          String(slot.clinicId ?? slot.clinic?.id) === String(assignedClinic.id) &&
          slot.type === "OPERATION" &&
          slot.isActive !== false,
      );
      setState({
        status: "ready",
        operations: Array.isArray(operations) ? operations : [],
        operationDays: Array.isArray(days) ? days.map((item) => item.date) : [],
        operationSlots,
        doctorId: doctor?.profile?.id ?? null,
        error: "",
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "error",
        error: getErrorMessage(error, "Unable to load operations."),
        operations: [],
        operationDays: [],
        operationSlots: [],
        doctorId: null,
      }));
    }
  }, [assignedClinic?.id]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  useEffect(() => {
    if (!formOpen) return undefined;

    let active = true;
    const timer = window.setTimeout(async () => {
      setPatientSearchState((current) => ({
        ...current,
        status: "loading",
        error: "",
      }));

      try {
        const response = await doctorPatientsApi.getPatients({
          page: 1,
          limit: 10,
          eligibleForOperation: true,
          ...(patientSearch.trim() ? { search: patientSearch.trim() } : {}),
        });

        if (active) {
          setPatientSearchState({
            status: "ready",
            patients: Array.isArray(response?.data) ? response.data : [],
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setPatientSearchState({
            status: "error",
            patients: [],
            error: getErrorMessage(error, "Unable to search your patients."),
          });
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [formOpen, patientSearch]);

  const todayOperations = state.operations.filter((operation) =>
    isToday(operation.requestedDate),
  );
  const paymentPending = state.operations.filter(
    (operation) => operation.status === "pending",
  );
  const readyToStart = todayOperations.filter(
    (operation) => operation.status === "confirmed",
  );
  const selectedDate = form.watch("requestedDate");
  const selectedDay = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).getDay()
    : null;
  const daySlots =
    selectedDay === null
      ? []
      : state.operationSlots.filter(
          (slot) => Number(slot.dayOfWeek) === selectedDay,
        );

  function resetOperationForm() {
    form.reset();
    setPatientSearch("");
    setSelectedPatient(null);
    setPatientSearchState({ status: "idle", patients: [], error: "" });
  }

  function openOperationForm() {
    resetOperationForm();
    setFormOpen(true);
  }

  function changePatientSearch(value) {
    setPatientSearch(value);
    if (selectedPatient) {
      setSelectedPatient(null);
      form.setValue("patientId", "", { shouldValidate: true });
    }
  }

  function selectPatient(patient) {
    setSelectedPatient(patient);
    setPatientSearch(patientName(patient));
    form.setValue("patientId", String(patient.id), { shouldValidate: true });
  }

  async function submitOperation(values) {
    if (!state.doctorId) {
      form.setError("root", {
        message: "Your doctor profile is unavailable. Refresh the page and try again.",
      });
      return;
    }
    if (
      !state.operationDays.some(
        (date) => dateKey(date) === values.requestedDate,
      )
    ) {
      form.setError("requestedDate", {
        message: "Choose a date that has operation availability.",
      });
      return;
    }
    if (
      !daySlots.some((slot) =>
        isInsideSlot(values.startTime, values.endTime, slot),
      )
    ) {
      form.setError("startTime", {
        message: "Choose a time fully inside one of your operation slots.",
      });
      return;
    }
    const conflictingOperation = state.operations.find(
      (operation) =>
        dateKey(operation.requestedDate) === values.requestedDate &&
        !["cancelled", "completed"].includes(operation.status) &&
        timesOverlap(
          values.startTime,
          values.endTime,
          formatTime(operation.startTime),
          formatTime(operation.endTime),
        ),
    );
    if (conflictingOperation) {
      form.setError("root", {
        message: "This time overlaps another active operation. Choose a different time.",
      });
      return;
    }

    setNotice("");
    try {
      await doctorAppointmentsApi.createOperation({
        patientId: Number(values.patientId),
        doctorId: Number(state.doctorId),
        clinicId: Number(assignedClinic.id),
        requestedDate: values.requestedDate,
        startTime: `${values.startTime}:00`,
        endTime: `${values.endTime}:00`,
        operationCost: Number(values.operationCost),
        ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
      });
      resetOperationForm();
      setFormOpen(false);
      setNotice("Operation scheduled. The patient must pay before it can be started.");
      await loadOperations();
    } catch (error) {
      form.setError("root", {
        message: getErrorMessage(error, "Unable to schedule this operation."),
      });
    }
  }

  async function runOperationAction(operation, action) {
    setActionId(operation.id);
    setNotice("");
    try {
      if (action === "start") {
        await doctorAppointmentsApi.startOperation(operation.id);
      } else if (action === "complete") {
        await doctorAppointmentsApi.completeOperation(operation.id);
      } else {
        await doctorAppointmentsApi.cancel(
          operation.id,
          "Cancelled by doctor before the operation started.",
        );
      }
      setNotice(
        action === "start"
          ? "Operation started."
          : action === "complete"
            ? "Operation completed."
            : "Operation cancelled. Any held operation payment was returned by the backend.",
      );
      await loadOperations();
    } catch (error) {
      setNotice(getErrorMessage(error, `Unable to ${action} this operation.`));
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <header className="rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-6 py-7 text-white shadow-lg shadow-blue-500/20 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
              Appointment type
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight">Operations</h1>
            <p className="mt-1 text-sm text-blue-100">
              Schedule and manage your paid procedure appointments. Operations do
              not enter the patient queue.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={openOperationForm}
              disabled={state.status !== "ready" || !state.operationDays.length}
            >
              <CalendarPlus className="h-4 w-4" /> Schedule operation
            </Button>
            <Button
              variant="secondary"
              className="bg-white/15 text-white hover:bg-white/25"
              onClick={loadOperations}
              disabled={state.status === "loading"}
            >
              <RefreshCw
                className={`h-4 w-4 ${state.status === "loading" ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Today", todayOperations.length],
            ["Awaiting payment", paymentPending.length],
            ["Ready to start", readyToStart.length],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                {label}
              </p>
              <p className="mt-1 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>
      </header>

      {notice ? (
        <p
          role="status"
          className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"
        >
          {notice}
        </p>
      ) : null}

      {state.status === "loading" ? (
        <div className="flex justify-center gap-2 rounded-3xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <LoaderCircle className="animate-spin" /> Loading operations...
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-rose-800">
          <AlertCircle className="h-5 w-5" />
          <p className="mt-3 text-sm">{state.error}</p>
          <Button variant="outline" className="mt-4" onClick={loadOperations}>
            Try again
          </Button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-black text-slate-900">Your operations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pending operations are waiting for the patient&apos;s payment.
              Confirmed operations are paid and ready on their scheduled date.
            </p>
          </div>
          {state.operations.length ? (
            <div className="divide-y divide-slate-100">
              {state.operations.map((operation) => (
                <article
                  key={operation.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/doctor/patients/${operation.patientId}?appointmentId=${operation.id}`}
                      className="font-bold text-blue-700 hover:underline"
                    >
                      {patientName(operation)}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDate(operation.requestedDate)} · {formatTime(operation.startTime)}–
                      {formatTime(operation.endTime)} · Cost {operation.operationCost ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {operation.notes || "No procedure notes recorded."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        operation.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : operation.status === "in_progress"
                            ? "bg-blue-50 text-blue-700"
                            : operation.status === "confirmed"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {statusLabel(operation.status)}
                    </span>
                    {operation.status === "confirmed" && isToday(operation.requestedDate) ? (
                      <Button
                        size="sm"
                        disabled={actionId === operation.id}
                        onClick={() => setPendingAction({ operation, action: "start" })}
                      >
                        <Play className="h-4 w-4" /> Start
                      </Button>
                    ) : null}
                    {operation.status === "in_progress" && isToday(operation.requestedDate) ? (
                      <Button
                        size="sm"
                        disabled={actionId === operation.id}
                        onClick={() => setPendingAction({ operation, action: "complete" })}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Complete
                      </Button>
                    ) : null}
                    {["pending", "confirmed"].includes(operation.status) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        disabled={actionId === operation.id}
                        onClick={() => setPendingAction({ operation, action: "cancel" })}
                      >
                        <XCircle className="h-4 w-4" /> Cancel
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <Stethoscope className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-bold text-slate-700">No operations scheduled.</p>
              <p className="mt-1 text-sm text-slate-500">
                Add an OPERATION slot in your schedule, then schedule an operation
                for an existing patient.
              </p>
            </div>
          )}
        </section>
      ) : null}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetOperationForm();
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule operation</DialogTitle>
          </DialogHeader>
          <form className="space-y-5 p-5" onSubmit={form.handleSubmit(submitOperation)} noValidate>
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              The patient must pay before this operation can start. Choose a time
              within your operation availability.
            </p>

            <div className="grid gap-1.5 text-sm font-medium text-slate-700">
              <span>Patient</span>
              <input type="hidden" {...form.register("patientId")} />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={patientSearch}
                  onChange={(event) => changePatientSearch(event.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="pl-9"
                  autoComplete="off"
                  aria-label="Search eligible patients"
                />
              </div>

              {selectedPatient ? (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  <UserRound className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    Selected: <strong>{patientName(selectedPatient)}</strong>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-blue-700"
                    onClick={() => changePatientSearch("")}
                  >
                    Change
                  </Button>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {patientSearchState.status === "loading" ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Searching patients...
                  </div>
                ) : null}
                {patientSearchState.status === "error" ? (
                  <p className="px-3 py-3 text-sm text-rose-700">{patientSearchState.error}</p>
                ) : null}
                {patientSearchState.status === "ready" && patientSearchState.patients.length ? (
                  <ul className="max-h-44 overflow-y-auto py-1">
                    {patientSearchState.patients.map((patient) => (
                      <li key={patient.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50"
                          onClick={() => selectPatient(patient)}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {patientInitials(patient)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-800">
                              {patientName(patient)}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {patient.user?.phone || patient.user?.email || "Patient"}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {patientSearchState.status === "ready" && !patientSearchState.patients.length ? (
                  <p className="px-3 py-3 text-sm text-slate-500">
                    {patientSearch.trim()
                      ? "No eligible patients match your search."
                      : "No eligible patients are available for an operation."}
                  </p>
                ) : null}
              </div>
              {form.formState.errors.patientId ? (
                <span className="text-xs text-rose-600">
                  {form.formState.errors.patientId.message}
                </span>
              ) : null}
              <p className="text-xs font-normal text-slate-500">
                Only patients with an active or completed consultation with you can
                be selected.
              </p>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Operation date
              <Input type="date" min={localDateKey()} {...form.register("requestedDate")} />
              {form.formState.errors.requestedDate ? (
                <span className="text-xs text-rose-600">
                  {form.formState.errors.requestedDate.message}
                </span>
              ) : null}
            </label>

            {selectedDate && daySlots.length ? (
              <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
                Operation availability: {daySlots.map((slot) => `${formatTime(slot.startTime)}–${formatTime(slot.endTime)}`).join(", ")}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Start time
                <Input type="time" {...form.register("startTime")} />
                {form.formState.errors.startTime ? (
                  <span className="text-xs text-rose-600">
                    {form.formState.errors.startTime.message}
                  </span>
                ) : null}
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                End time
                <Input type="time" {...form.register("endTime")} />
                {form.formState.errors.endTime ? (
                  <span className="text-xs text-rose-600">
                    {form.formState.errors.endTime.message}
                  </span>
                ) : null}
              </label>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Operation cost
              <Input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                {...form.register("operationCost")}
              />
              {form.formState.errors.operationCost ? (
                <span className="text-xs text-rose-600">
                  {form.formState.errors.operationCost.message}
                </span>
              ) : null}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Procedure and preparation notes{" "}
              <span className="font-normal text-slate-500">(optional)</span>
              <textarea
                rows={3}
                {...form.register("notes")}
                className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
              />
            </label>

            {form.formState.errors.root ? (
              <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <CalendarPlus />
                )}
                Schedule operation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !actionId) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === "complete"
                ? "Complete this operation?"
                : pendingAction?.action === "cancel"
                  ? "Cancel this operation?"
                  : "Start this operation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === "complete"
                ? "This will complete the operation and finalize the patient's held payment. The current backend does not save an operative report at completion."
                : pendingAction?.action === "cancel"
                  ? "This cancels the operation before it starts. If the patient already paid, the backend returns the held payment."
                  : "This marks the operation as in progress and records its actual start time."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(actionId)}>Go back</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(actionId)}
              onClick={async () => {
                const action = pendingAction;
                setPendingAction(null);
                if (action) await runOperationAction(action.operation, action.action);
              }}
            >
              {actionId ? (
                <LoaderCircle className="animate-spin" />
              ) : pendingAction?.action === "complete" ? (
                "Complete operation"
              ) : pendingAction?.action === "cancel" ? (
                "Cancel operation"
              ) : (
                "Start operation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
