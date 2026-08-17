import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { z } from "zod";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Clock,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { doctorSchedulesApi } from "@/api/doctorSchedulesApi";
import { notificationsApi } from "@/api/notificationsApi";
import { DoctorClinicAssignmentContext } from "@/context/DoctorClinicAssignmentContext";
import { useDoctorLocale } from "@/context/DoctorLocaleContext";
import { markDoctorScheduleUpdatesSeen } from "@/lib/doctorAttention";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const DAYS_OF_WEEK = [
  { key: 0, label: "Sunday" },
  { key: 1, label: "Monday" },
  { key: 2, label: "Tuesday" },
  { key: 3, label: "Wednesday" },
  { key: 4, label: "Thursday" },
  { key: 5, label: "Friday" },
  { key: 6, label: "Saturday" },
];

const SCHEDULE_TYPES = ["NORMAL", "BREAK", "EMERGENCY", "OPERATION"];
const SCHEDULE_UPDATE_KEYS = new Set([
  "doctor.schedule.approved",
  "doctor.schedule.rejected",
  "schedule.request_approved",
  "schedule.request_rejected",
]);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid time.");

const slotSchema = z.object({
  startTime: timeSchema,
  endTime: timeSchema,
  type: z.enum(SCHEDULE_TYPES),
  notes: z.string().trim().max(1000, "Notes must be 1,000 characters or fewer.").optional(),
}).superRefine((slot, context) => {
  if (slot.startTime >= slot.endTime) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after start time." });
  }
});

const scheduleSchema = z.object({
  slots: z.array(slotSchema).min(1, "Add at least one availability slot."),
}).superRefine((value, context) => {
  for (let first = 0; first < value.slots.length; first += 1) {
    for (let second = first + 1; second < value.slots.length; second += 1) {
      const a = value.slots[first];
      const b = value.slots[second];
      if (a.startTime < b.endTime && a.endTime > b.startTime) {
        context.addIssue({ code: "custom", path: ["slots", second, "startTime"], message: "Schedule slots cannot overlap." });
      }
    }
  }
});

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function normalizeTime(value) {
  return String(value || "").slice(0, 5);
}

function formatDisplayTime(value) {
  const normalized = normalizeTime(value);
  const [hourValue, minute] = normalized.split(":");
  const hour = Number(hourValue);

  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !/^\d{2}$/.test(minute || "")) {
    return normalized;
  }

  return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}

function createDefaultSlot() {
  return { startTime: "09:00", endTime: "17:00", type: "NORMAL", notes: "" };
}

function formatUpdateDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function DoctorSchedule() {
  const { text } = useDoctorLocale();
  const { doctorUserId, refreshDoctorAttention } = useOutletContext();
  const { assignedClinic } = useContext(DoctorClinicAssignmentContext) || {};
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [activeDayKey, setActiveDayKey] = useState(new Date().getDay());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleUpdates, setScheduleUpdates] = useState({ status: "loading", items: [], error: "" });

  const scheduleForm = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { slots: [createDefaultSlot()] },
  });
  const { fields, append, remove } = useFieldArray({ control: scheduleForm.control, name: "slots" });

  const loadSchedule = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");
    try {
      const data = await doctorSchedulesApi.getOwnSchedule();
      setScheduleSlots(Array.isArray(data) ? data : []);
      setLoadState("ready");
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load your weekly schedule."));
      setLoadState("error");
    }
  }, []);

  const loadScheduleUpdates = useCallback(async () => {
    setScheduleUpdates((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const notifications = await notificationsApi.getMyNotifications();
      const updates = notifications
        .filter((notification) => SCHEDULE_UPDATE_KEYS.has(notification.messageKey))
        .slice(0, 5);
      setScheduleUpdates({ status: "ready", items: updates, error: "" });
      markDoctorScheduleUpdatesSeen(doctorUserId);
      refreshDoctorAttention?.();
    } catch (error) {
      setScheduleUpdates({ status: "error", items: [], error: getErrorMessage(error, "Unable to load schedule updates.") });
    }
  }, [doctorUserId, refreshDoctorAttention]);

  const refreshScheduleData = useCallback(async () => {
    await Promise.all([loadSchedule(), loadScheduleUpdates()]);
  }, [loadSchedule, loadScheduleUpdates]);

  useEffect(() => {
    const timer = window.setTimeout(refreshScheduleData, 0);
    return () => window.clearTimeout(timer);
  }, [refreshScheduleData]);

  const assignedClinicId = assignedClinic?.id;
  const assignedClinicName = assignedClinic?.name || "Assigned clinic";
  const filteredSlots = useMemo(
    () => scheduleSlots.filter((slot) => String(slot.clinicId ?? slot.clinic?.id) === String(assignedClinicId)),
    [assignedClinicId, scheduleSlots],
  );
  const slotsByDay = useMemo(() => {
    const map = Object.fromEntries(DAYS_OF_WEEK.map(({ key }) => [key, []]));
    filteredSlots.forEach((slot) => {
      const day = Number(slot.dayOfWeek);
      if (map[day]) map[day].push(slot);
    });
    return map;
  }, [filteredSlots]);
  const activeDaySlots = slotsByDay[activeDayKey] || [];
  const activeDayLabel = text(DAYS_OF_WEEK.find((day) => day.key === activeDayKey)?.label || "Sunday");
  const hasExistingScheduleForDay = activeDaySlots.length > 0;
  const scheduledDayCount = DAYS_OF_WEEK.filter(({ key }) => (slotsByDay[key] || []).length > 0).length;
  const activeSlotCount = filteredSlots.length;

  function openScheduleModal() {
    const slots = activeDaySlots.length
      ? activeDaySlots.map((slot) => ({ startTime: normalizeTime(slot.startTime), endTime: normalizeTime(slot.endTime), type: slot.type || "NORMAL", notes: slot.notes || "" }))
      : [createDefaultSlot()];
    scheduleForm.reset({ slots });
    setSubmitError("");
    setShowRequestModal(true);
  }

  async function submitSchedule(values) {
    if (!assignedClinicId) {
      setSubmitError("Your clinic assignment is unavailable. Refresh and try again.");
      return;
    }

    setSubmitError("");
    setNotice("");
    setIsSavingSchedule(true);
    try {
      const result = await doctorSchedulesApi.createOrUpdateSchedule({
        clinicId: Number(assignedClinicId),
        dayOfWeek: activeDayKey,
        isActive: true,
        slots: values.slots.map((slot) => ({
          startTime: normalizeTime(slot.startTime),
          endTime: normalizeTime(slot.endTime),
          type: slot.type,
          ...(slot.notes?.trim() ? { notes: slot.notes.trim() } : {}),
        })),
      });
      const isInitialSetup = Array.isArray(result);
      setNotice(isInitialSetup ? "Availability saved." : "Your schedule change request is being reviewed by the admin. Your current hours stay active until it is approved.");
      setShowRequestModal(false);
      scheduleForm.reset({ slots: [createDefaultSlot()] });
      await refreshScheduleData();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to save this schedule. Check the slots and try again."));
      setShowRequestModal(true);
    } finally {
      setIsSavingSchedule(false);
    }
  }

  function prepareScheduleSubmission(values) {
    setPendingSubmission({
      values,
      dayLabel: activeDayLabel,
      isChangeRequest: hasExistingScheduleForDay,
    });
    setShowRequestModal(false);
  }

  async function confirmScheduleSubmission() {
    const submission = pendingSubmission;
    setPendingSubmission(null);
    if (submission) await submitSchedule(submission.values);
  }

  if (loadState === "loading") {
    return <section className="flex min-h-[40vh] items-center justify-center gap-3 text-sm font-medium text-slate-500"><Loader2 className="animate-spin text-blue-600" size={22} /> Loading your schedule…</section>;
  }

  if (loadState === "error") {
    return <section className="mx-auto w-full max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-7 text-rose-800"><AlertCircle size={26} /><h1 className="mt-4 text-lg font-bold">Schedule unavailable</h1><p className="mt-2 text-sm">{loadError}</p><Button className="mt-5" onClick={loadSchedule}>Try again</Button></section>;
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 font-sans text-slate-900 antialiased lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="relative flex flex-col justify-between gap-4 rounded-[24px] bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-6 py-5 text-white shadow-lg sm:px-8 sm:py-6 lg:flex-row lg:items-center">
          <div className="relative z-10 space-y-1.5"><span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> TABIBI PORTAL</span><h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Doctor Schedule</h1><p className="max-w-xl text-xs font-medium text-blue-100">Review your weekly operational hours at your assigned clinic.</p></div>
          <div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-inner backdrop-blur-md"><span className="rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-xs font-bold text-white sm:text-sm">{assignedClinicName}</span></div><Button type="button" variant="ghost" size="icon" onClick={loadSchedule} className="text-white hover:bg-white/15 hover:text-white" aria-label="Refresh schedule"><RefreshCw size={18} /></Button></div>
        </header>

        {notice ? <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}

        <section className="grid gap-3 sm:grid-cols-2" aria-label="Weekly availability summary">
          <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Scheduled days</p><p className="mt-1 text-2xl font-black text-slate-900">{scheduledDayCount}<span className="ml-1 text-sm font-semibold text-slate-400">of 7</span></p><p className="mt-1 text-xs text-slate-500">Days with at least one active availability slot.</p></article>
          <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Weekly slots</p><p className="mt-1 text-2xl font-black text-slate-900">{activeSlotCount}</p><p className="mt-1 text-xs text-slate-500">Select a day below to review or request a change.</p></article>
        </section>

        <nav className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" aria-label="Schedule days">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const count = (slotsByDay[key] || []).length;
            const isSelected = activeDayKey === key;
            return <button key={key} type="button" onClick={() => setActiveDayKey(key)} className={`flex shrink-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-3 text-xs font-bold transition-all ${isSelected ? "scale-[1.02] border-blue-300 bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] text-white shadow-md shadow-blue-500/20" : "border-slate-100 bg-white text-slate-600 shadow-xs hover:border-slate-200 hover:bg-slate-50"}`}><span>{text(label)}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isSelected ? "bg-white/25 text-white" : count > 0 ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-400"}`}>{count}</span></button>;
          })}
        </nav>

        <section className="space-y-6 rounded-[24px] border border-slate-100 bg-white p-6 shadow-xs sm:p-8"><div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-black text-slate-900 sm:text-lg">{activeDayLabel} {text("Schedule")}</h2><p className="mt-0.5 text-xs text-slate-400"><span className="font-bold text-slate-700">{assignedClinicName}</span></p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-sky-100 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-600">{activeDaySlots.length} {text("Active Slots")}</span><Button onClick={openScheduleModal} disabled={!assignedClinicId} className="gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"><CalendarClock size={16} /><span>{hasExistingScheduleForDay ? `Request change for ${activeDayLabel}` : `Set ${activeDayLabel} availability`}</span></Button></div></div>
          {activeDaySlots.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{activeDaySlots.map((slot, index) => <article key={slot.id || index} className="group relative space-y-3 overflow-hidden rounded-2xl border border-slate-200 bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-surface"><div className="absolute top-0 right-0 left-0 h-1 bg-primary opacity-70 transition-opacity group-hover:opacity-100" /><div className="flex flex-col items-start gap-2 pt-1"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary shadow-2xs"><Clock size={16} /></div><span className="text-sm font-extrabold tracking-tight text-slate-900">{formatDisplayTime(slot.startTime)} – {formatDisplayTime(slot.endTime)}</span></div><span className="rounded-lg border border-sky-200/50 bg-sky-100/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700">{slot.type}</span></div>{slot.notes ? <p className="border-l-2 border-primary/25 pl-10 text-xs font-medium text-slate-600">{slot.notes}</p> : <p className="pl-10 text-xs italic text-slate-400">No additional notes provided.</p>}</article>)}</div> : <div className="space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center"><p className="text-sm font-bold text-slate-700">No shifts scheduled for {activeDayLabel}</p><p className="text-xs text-slate-400">Use the {activeDayLabel} availability button above to set this day&apos;s hours.</p></div>}
        </section>

        <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div><h2 className="text-base font-black text-slate-900">Schedule updates</h2><p className="mt-1 text-sm text-slate-500">Approval and rejection information from the clinic.</p></div>
            <Button type="button" variant="outline" size="sm" onClick={loadScheduleUpdates} disabled={scheduleUpdates.status === "loading"}><RefreshCw className={scheduleUpdates.status === "loading" ? "animate-spin" : ""} size={15} /> Refresh updates</Button>
          </div>
          {scheduleUpdates.status === "error" ? <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800"><p>{scheduleUpdates.error}</p><Button type="button" variant="outline" size="sm" className="mt-3" onClick={loadScheduleUpdates}>Try again</Button></div> : null}
          {scheduleUpdates.status === "loading" ? <p className="mt-4 text-sm text-slate-500">Loading schedule updates…</p> : null}
          {scheduleUpdates.status === "ready" && scheduleUpdates.items.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No approved or rejected schedule changes yet.</p> : null}
          {scheduleUpdates.status === "ready" && scheduleUpdates.items.length ? <div className="mt-4 space-y-3">{scheduleUpdates.items.map((update) => {
            const rejected = String(update.messageKey || "").includes("rejected");
            const title = rejected ? text("Schedule change rejected") : text("Schedule change approved");
            const body = rejected ? text("Your schedule change request was rejected.") : text("Your schedule change request was approved.");
            return <article key={update.id} className={`rounded-2xl border px-4 py-3 ${rejected ? "border-rose-100 bg-rose-50" : "border-emerald-100 bg-emerald-50"}`}><div className="flex items-center justify-between gap-3"><p className={`text-sm font-bold ${rejected ? "text-rose-800" : "text-emerald-800"}`}>{title}</p><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${rejected ? "border-rose-200 bg-white/70 text-rose-700" : "border-emerald-200 bg-white/70 text-emerald-700"}`}>{rejected ? "Rejected" : "Approved"}</span></div><p className={`mt-1 text-sm ${rejected ? "text-rose-700" : "text-emerald-700"}`}>{body}</p><p className={`mt-2 text-xs ${rejected ? "text-rose-600" : "text-emerald-600"}`}>{formatUpdateDate(update.sentAt || update.created_at || update.createdAt)}</p></article>;
          })}</div> : null}
        </section>
      </div>

      {showRequestModal ? <ScheduleModal activeDayLabel={activeDayLabel} clinicName={assignedClinicName} isChangeRequest={hasExistingScheduleForDay} scheduleForm={scheduleForm} fields={fields} append={append} remove={remove} submitError={submitError} onClose={() => setShowRequestModal(false)} onSubmit={scheduleForm.handleSubmit(prepareScheduleSubmission)} /> : null}
      <ScheduleConfirmation submission={pendingSubmission} isSaving={isSavingSchedule} onCancel={() => { setPendingSubmission(null); setShowRequestModal(true); }} onConfirm={confirmScheduleSubmission} />
    </div>
  );
}

function ScheduleConfirmation({ submission, isSaving, onCancel, onConfirm }) {
  const isChangeRequest = submission?.isChangeRequest;

  return <AlertDialog open={Boolean(submission)} onOpenChange={(open) => { if (!open && !isSaving) onCancel(); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{isChangeRequest ? "Submit this schedule change for approval?" : "Set this initial availability immediately?"}</AlertDialogTitle><AlertDialogDescription>{isChangeRequest ? `Your current ${submission?.dayLabel || "selected day"} schedule will remain active until an administrator approves this request.` : `This is the first schedule setup for ${submission?.dayLabel || "this day"}. It will become active immediately without administrator approval. Future changes to this day will require approval.`}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isSaving}>Go back</AlertDialogCancel><AlertDialogAction disabled={isSaving} onClick={onConfirm}>{isSaving ? <><Loader2 className="animate-spin" size={16} /> Saving…</> : isChangeRequest ? "Submit request" : "Set availability"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

function ScheduleModal({ activeDayLabel, clinicName, isChangeRequest, scheduleForm, fields, append, remove, submitError, onClose, onSubmit }) {
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"><div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl"><div className="border-b border-slate-100 bg-[#f8fafc] p-8"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><CalendarClock size={24} /></div><div><h2 className="text-xl font-black text-slate-900">{isChangeRequest ? "Request Schedule Change" : "Set Availability"}</h2><p className="mt-0.5 text-xs font-bold text-slate-500">{activeDayLabel} · {clinicName}</p></div></div><button type="button" onClick={onClose} className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-200/50" aria-label="Close schedule form"><Plus className="rotate-45" size={24} /></button></div></div>
    <form onSubmit={onSubmit} className="space-y-6 p-8"><div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs font-bold leading-relaxed text-blue-700"><Info size={20} className="shrink-0 text-blue-500" /><p>{isChangeRequest ? "Your current schedule stays active until an administrator reviews this change request." : "Your first availability for this day will be saved immediately."}</p></div>{submitError ? <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600"><AlertCircle size={20} /><span>{submitError}</span></div> : null}
      <div className="max-h-[40vh] space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">{fields.map((field, index) => <div key={field.id} className="group relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5"><div className="grid grid-cols-1 gap-4 md:grid-cols-4"><label className="grid gap-1.5"><span className="ml-1 text-[10px] font-black uppercase text-slate-400">Start time</span><Input type="time" aria-label={`Slot ${index + 1} start time`} {...scheduleForm.register(`slots.${index}.startTime`)} className="h-10 rounded-xl bg-white text-xs font-bold" />{scheduleForm.formState.errors.slots?.[index]?.startTime ? <span className="text-xs text-rose-600">{scheduleForm.formState.errors.slots[index].startTime.message}</span> : null}</label><label className="grid gap-1.5"><span className="ml-1 text-[10px] font-black uppercase text-slate-400">End time</span><Input type="time" aria-label={`Slot ${index + 1} end time`} {...scheduleForm.register(`slots.${index}.endTime`)} className="h-10 rounded-xl bg-white text-xs font-bold" />{scheduleForm.formState.errors.slots?.[index]?.endTime ? <span className="text-xs text-rose-600">{scheduleForm.formState.errors.slots[index].endTime.message}</span> : null}</label><label className="grid gap-1.5"><span className="ml-1 text-[10px] font-black uppercase text-slate-400">Shift type</span><select {...scheduleForm.register(`slots.${index}.type`)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">{SCHEDULE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label className="grid gap-1.5"><span className="ml-1 text-[10px] font-black uppercase text-slate-400">Notes</span><div className="flex gap-2"><Input placeholder="Optional notes" {...scheduleForm.register(`slots.${index}.notes`)} className="h-10 min-w-0 flex-1 rounded-xl bg-white text-xs font-bold" /><Button type="button" variant="ghost" disabled={fields.length === 1} onClick={() => remove(index)} className="h-10 w-10 rounded-xl border border-slate-100 p-0 text-rose-500 hover:bg-rose-50 disabled:opacity-40"><Trash2 size={16} /></Button></div>{scheduleForm.formState.errors.slots?.[index]?.notes ? <span className="text-xs text-rose-600">{scheduleForm.formState.errors.slots[index].notes.message}</span> : null}</label></div></div>)}</div>{scheduleForm.formState.errors.slots?.message ? <p className="text-sm text-rose-600">{scheduleForm.formState.errors.slots.message}</p> : null}
      <div className="flex flex-col gap-4 pt-2 sm:flex-row"><Button type="button" variant="outline" onClick={() => append(createDefaultSlot())} className="h-14 flex-1 gap-2 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"><Plus size={20} /> Add another slot</Button><Button type="submit" disabled={scheduleForm.formState.isSubmitting} className="h-14 flex-1 gap-2 rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700">{scheduleForm.formState.isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />} {scheduleForm.formState.isSubmitting ? "Saving…" : isChangeRequest ? "Submit request" : "Save availability"}</Button></div>
    </form></div></div>;
}
