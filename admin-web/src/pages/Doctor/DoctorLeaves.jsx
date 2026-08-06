import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Calendar, CalendarOff, Clock, LoaderCircle, Plus, RefreshCw, Trash2 } from "lucide-react";

import { doctorLeavesApi } from "@/api/doctorLeavesApi";
import { useDoctorLocale } from "@/context/DoctorLocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid time.");
const leaveSchema = z.object({
  exceptionDate: z.string().min(1, "Choose a date."),
  isPartial: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string().trim().max(1000, "Reason must be 1,000 characters or fewer."),
}).superRefine((value, context) => {
  if (!value.isPartial) return;
  if (!value.startTime) context.addIssue({ code: "custom", path: ["startTime"], message: "Choose a start time." });
  else if (!timeSchema.safeParse(value.startTime).success) context.addIssue({ code: "custom", path: ["startTime"], message: "Use a valid start time." });
  if (!value.endTime) context.addIssue({ code: "custom", path: ["endTime"], message: "Choose an end time." });
  else if (!timeSchema.safeParse(value.endTime).success) context.addIssue({ code: "custom", path: ["endTime"], message: "Use a valid end time." });
  if (value.startTime && value.endTime && value.startTime >= value.endTime) context.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after start time." });
});

const defaultValues = { exceptionDate: "", isPartial: false, startTime: "", endTime: "", reason: "" };

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatTime(value) {
  return String(value || "").slice(0, 5);
}

function normalizeTime(value) {
  return `${value}:00`;
}

export default function DoctorLeaves() {
  const { text } = useDoctorLocale();
  const [leaves, setLeaves] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [pendingLeave, setPendingLeave] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const leaveForm = useForm({ resolver: zodResolver(leaveSchema), defaultValues });
  const isPartial = useWatch({ control: leaveForm.control, name: "isPartial" });

  const loadLeaves = useCallback(async () => {
    setLoadState("loading");
    setError("");
    try {
      const data = await doctorLeavesApi.getOwnLeaves();
      setLeaves(Array.isArray(data) ? data : []);
      setLoadState("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load your time-off entries."));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadLeaves, 0);
    return () => window.clearTimeout(timer);
  }, [loadLeaves]);

  function openCreateForm() {
    leaveForm.reset(defaultValues);
    setError("");
    setFormOpen(true);
  }

  function prepareCreate(values) {
    setPendingLeave(values);
    setFormOpen(false);
  }

  async function createLeave() {
    const values = pendingLeave;
    if (!values) return;
    setPendingLeave(null);
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      await doctorLeavesApi.createLeave({
        exceptionDate: values.exceptionDate,
        ...(values.isPartial ? { startTime: normalizeTime(values.startTime), endTime: normalizeTime(values.endTime) } : {}),
        ...(values.reason.trim() ? { reason: values.reason.trim() } : {}),
      });
      leaveForm.reset(defaultValues);
      setNotice("Time off saved. Any overlapping confirmed appointments were handled by the server.");
      await loadLeaves();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to save this time-off entry."));
      setFormOpen(true);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLeave() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError("");
    setNotice("");
    try {
      await doctorLeavesApi.deleteLeave(deleteTarget.id);
      setNotice("Time-off entry removed. Previously cancelled appointments are not restored automatically.");
      setDeleteTarget(null);
      await loadLeaves();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to remove this time-off entry."));
    } finally {
      setIsDeleting(false);
    }
  }

  return <div className="space-y-8 pb-10">
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-6 text-white shadow-lg shadow-[#1e61dc]/20 sm:flex sm:items-center sm:justify-between"><div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" /><div className="relative z-10 space-y-1.5"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md"><CalendarOff size={14} /> Time off & schedule exceptions</span><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Leaves & Time Off</h1><p className="max-w-xl text-xs font-medium text-blue-100 sm:text-sm">A full-day leave blocks the whole day; partial time off blocks only the specified hours.</p></div><Button onClick={openCreateForm} className="relative z-10 mt-5 gap-2 rounded-2xl bg-white px-5 py-5 text-xs font-bold text-[#1e61dc] shadow-md hover:bg-blue-50 sm:mt-0"><Plus size={18} /> Add time off</Button></header>

    {notice ? <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}
    {error && loadState !== "error" ? <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</p> : null}

    {loadState === "loading" ? <section className="flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white py-16 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading time off…</section> : null}
    {loadState === "error" ? <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><h2 className="font-bold">Time off unavailable</h2><p className="mt-1 text-sm">{error}</p><Button className="mt-4" variant="outline" onClick={loadLeaves}><RefreshCw /> Try again</Button></div></div></section> : null}
    {loadState === "ready" ? <section className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xs"><div className="flex items-center justify-between border-b border-slate-100 p-6"><div><h2 className="text-sm font-bold text-slate-800">{text("Your time-off entries")}</h2><p className="mt-1 text-xs text-slate-500">{text("These are active schedule exceptions.")}</p></div><span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{text("Total")}: {leaves.length}</span></div><div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400"><th className="px-6 py-4">{text("Date")}</th><th className="px-6 py-4">{text("Type")}</th><th className="px-6 py-4">{text("Hours")}</th><th className="px-6 py-4">{text("Reason")}</th><th className="px-6 py-4 text-right">{text("Actions")}</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">{leaves.length ? leaves.map((leave) => <tr key={leave.id} className="transition-all hover:bg-slate-50/50"><td className="flex items-center gap-2 px-6 py-4 font-bold text-slate-900"><Calendar size={15} className="text-[#1e61dc]" />{formatDate(leave.exceptionDate)}</td><td className="px-6 py-4"><span className={`rounded-xl px-2.5 py-1 text-[10px] font-bold ${leave.startTime ? "border border-amber-200/50 bg-amber-50 text-amber-700" : "border border-blue-200/50 bg-blue-50 text-[#1e61dc]"}`}>{text(leave.startTime ? "Partial hours" : "Full day")}</span></td><td className="px-6 py-4 text-slate-600">{leave.startTime ? <span className="flex items-center gap-1.5 font-semibold text-slate-700"><Clock size={14} className="text-slate-400" />{formatTime(leave.startTime)} – {formatTime(leave.endTime)}</span> : text("Whole day")}</td><td className="max-w-xs truncate px-6 py-4 text-slate-600">{leave.reason || text("No reason provided")}</td><td className="px-6 py-4 text-right"><button type="button" onClick={() => setDeleteTarget(leave)} className="rounded-xl p-2 text-rose-500 transition-all hover:bg-rose-50" title={text("Remove time off")} aria-label={`${text("Remove time off")} ${formatDate(leave.exceptionDate)}`}><Trash2 size={16} /></button></td></tr>) : <tr><td colSpan="5" className="px-6 py-14 text-center text-sm text-slate-500">{text("No time-off entries yet.")}</td></tr>}</tbody></table></div></section> : null}

    <Dialog open={formOpen} onOpenChange={(open) => { if (!isSaving) setFormOpen(open); }}><DialogContent className="sm:max-w-lg" showCloseButton={!isSaving}><DialogHeader><DialogTitle>Add time off</DialogTitle></DialogHeader><form className="space-y-5 p-5" onSubmit={leaveForm.handleSubmit(prepareCreate)} noValidate><p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">This takes effect immediately. The backend may cancel confirmed appointments that overlap this time off and notify those patients.</p><label className="grid gap-1.5 text-sm font-medium text-slate-700">Exception date<Input type="date" {...leaveForm.register("exceptionDate")} />{leaveForm.formState.errors.exceptionDate ? <span className="text-xs text-rose-600">{leaveForm.formState.errors.exceptionDate.message}</span> : null}</label><label className="flex items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" {...leaveForm.register("isPartial")} className="h-4 w-4 rounded border-slate-300 text-blue-600" />Partial time off (specific hours)</label>{isPartial ? <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium text-slate-700">Start time<Input type="time" {...leaveForm.register("startTime")} />{leaveForm.formState.errors.startTime ? <span className="text-xs text-rose-600">{leaveForm.formState.errors.startTime.message}</span> : null}</label><label className="grid gap-1.5 text-sm font-medium text-slate-700">End time<Input type="time" {...leaveForm.register("endTime")} />{leaveForm.formState.errors.endTime ? <span className="text-xs text-rose-600">{leaveForm.formState.errors.endTime.message}</span> : null}</label></div> : null}<label className="grid gap-1.5 text-sm font-medium text-slate-700">Reason <span className="font-normal text-slate-500">(optional)</span><textarea rows={4} {...leaveForm.register("reason")} placeholder="Reason for time off" className="w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-blue-500" />{leaveForm.formState.errors.reason ? <span className="text-xs text-rose-600">{leaveForm.formState.errors.reason.message}</span> : null}</label><DialogFooter><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit">Continue</Button></DialogFooter></form></DialogContent></Dialog>

    <AlertDialog open={Boolean(pendingLeave)} onOpenChange={(open) => { if (!open && !isSaving) { setPendingLeave(null); setFormOpen(true); } }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Apply this time off immediately?</AlertDialogTitle><AlertDialogDescription>It will take effect now. Confirmed appointments that overlap it can be cancelled by the backend. Removing this entry later does not automatically restore those appointments.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isSaving}>Go back</AlertDialogCancel><AlertDialogAction disabled={isSaving} onClick={createLeave}>{isSaving ? <><LoaderCircle className="animate-spin" size={16} /> Saving…</> : "Apply time off"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteTarget(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove this time-off entry?</AlertDialogTitle><AlertDialogDescription>This removes the schedule exception only. It does not restore appointments that were cancelled when the entry was created.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Keep entry</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={isDeleting} onClick={deleteLeave}>{isDeleting ? <><LoaderCircle className="animate-spin" size={16} /> Removing…</> : "Remove time off"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
