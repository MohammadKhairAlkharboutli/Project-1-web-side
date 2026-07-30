import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck, ClipboardList, FileText, LoaderCircle, RefreshCw, Stethoscope, XCircle } from "lucide-react";

import { doctorAppointmentsApi } from "@/api/doctorWorkflowApi";
import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import { formatAppointmentDate, formatAppointmentTimeRange, formatDateTime, getPriorityLabel, parseAppointmentDateTime } from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function InfoItem({ label, children }) {
  return <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm font-medium leading-6 text-slate-800">{children || "Not recorded"}</dd></div>;
}

function canMarkNoShow(appointment) {
  if (appointment?.status !== "confirmed" || appointment?.queue || appointment?.checkinTime) return false;
  const scheduledStart = parseAppointmentDateTime(appointment.requestedDate, appointment.startTime);
  return Boolean(scheduledStart && scheduledStart < new Date());
}

function localDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export default function DoctorAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadAppointment = useCallback(async () => {
    setLoadState("loading");
    setError("");
    try {
      const data = await doctorAppointmentsApi.getAppointment(appointmentId);
      setAppointment(data);
      setLoadState("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load this appointment."));
      setLoadState("error");
    }
  }, [appointmentId]);

  useEffect(() => {
    const timer = window.setTimeout(loadAppointment, 0);
    return () => window.clearTimeout(timer);
  }, [loadAppointment]);

  async function runAction(name, action, successMessage) {
    setActionLoading(name);
    setNotice("");
    setError("");
    try {
      await action();
      await loadAppointment();
      setNotice(successMessage);
    } catch (actionError) {
      setError(getErrorMessage(actionError, "The appointment could not be updated."));
    } finally {
      setActionLoading("");
    }
  }

  const queueStatus = appointment?.queue?.status;
  const canCheckIn = appointment?.status === "confirmed" && String(appointment.requestedDate).slice(0, 10) === localDateString() && !appointment.queue;
  const canCancel = ["pending", "confirmed"].includes(appointment?.status) && !appointment?.queue;
  const isNoShowEligible = useMemo(() => canMarkNoShow(appointment), [appointment]);

  if (loadState === "loading") return <section className="mx-auto flex w-full max-w-4xl items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white p-12 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading appointment…</section>;
  if (loadState === "error") return <section className="mx-auto w-full max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-800"><h1 className="text-lg font-bold">Appointment unavailable</h1><p className="mt-2 text-sm">{error}</p><div className="mt-5 flex gap-3"><Button onClick={loadAppointment}>Try again</Button><Button variant="outline" onClick={() => navigate("/doctor/appointments")}>Back to appointments</Button></div></section>;

  return <main className="mx-auto w-full max-w-5xl space-y-6 pb-10"><header className="rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-6 text-white shadow-lg shadow-blue-500/20 sm:p-8"><Button variant="ghost" size="sm" className="-ml-2 text-blue-100 hover:bg-white/10 hover:text-white" onClick={() => navigate("/doctor/appointments")}><ArrowLeft className="h-4 w-4" /> Back to appointments</Button><div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-100">Appointment #{appointment.id}</p><h1 className="mt-1 text-2xl font-black tracking-tight">{appointment.patient?.user?.full_name || [appointment.patient?.user?.firstName, appointment.patient?.user?.lastName].filter(Boolean).join(" ") || "Patient"}</h1><p className="mt-1 text-sm text-blue-100">{formatAppointmentDate(appointment.requestedDate)} · {formatAppointmentTimeRange(appointment)}</p></div><div className="flex flex-wrap gap-2"><AppointmentStatusBadge status={appointment.status} /><AppointmentPriorityBadge priority={appointment.priority} /></div></div></header>
    {notice ? <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}{error ? <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</p> : null}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black text-slate-900">Visit actions</h2><p className="mt-1 text-sm text-slate-500">Check in a confirmed visit, then continue through the live queue.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link to={`/doctor/patients/${appointment.patientId}?appointmentId=${appointment.id}`}><FileText className="h-4 w-4" /> Medical file</Link></Button>{canCheckIn ? <Button disabled={Boolean(actionLoading)} onClick={() => runAction("checkin", () => doctorAppointmentsApi.checkIn(appointment.id), "Patient checked in and added to the queue.")}><CalendarCheck className="h-4 w-4" /> {actionLoading === "checkin" ? "Checking in…" : "Check in"}</Button> : null}{queueStatus ? <Button asChild><Link to={queueStatus === "in_progress" ? `/doctor/consultation/${appointment.id}` : "/doctor/queue"}><ClipboardList className="h-4 w-4" /> {queueStatus === "in_progress" ? "Resume consultation" : "Open queue"}</Link></Button> : null}{canCancel ? <Button variant="outline" disabled={Boolean(actionLoading)} onClick={() => setCancelOpen(true)}><XCircle className="h-4 w-4" /> Cancel</Button> : null}{isNoShowEligible ? <NoShowButton disabled={Boolean(actionLoading)} onConfirm={() => runAction("no-show", () => doctorAppointmentsApi.markNoShow(appointment.id), "Appointment marked as no-show.")} /> : null}<Button variant="outline" size="icon" disabled={loadState === "loading"} onClick={loadAppointment} aria-label="Refresh appointment"><RefreshCw className="h-4 w-4" /></Button></div></div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><InfoItem label="Patient">{appointment.patient?.user?.full_name || [appointment.patient?.user?.firstName, appointment.patient?.user?.lastName].filter(Boolean).join(" ")}</InfoItem><InfoItem label="Phone">{appointment.patient?.user?.phone}</InfoItem><InfoItem label="Clinic">{appointment.clinic?.name}</InfoItem><InfoItem label="Date">{formatAppointmentDate(appointment.requestedDate)}</InfoItem><InfoItem label="Time">{formatAppointmentTimeRange(appointment)}</InfoItem><InfoItem label="Visit type">{appointment.type}</InfoItem><InfoItem label="Priority">{getPriorityLabel(appointment.priority)}</InfoItem><InfoItem label="Checked in">{formatDateTime(appointment.checkinTime)}</InfoItem><InfoItem label="Queue">{appointment.queue ? `Position ${appointment.queue.position} · ${String(appointment.queue.status).replaceAll("_", " ")}` : "Not checked in"}</InfoItem>{appointment.actualStartTime ? <InfoItem label="Actual start">{formatDateTime(appointment.actualStartTime)}</InfoItem> : null}{appointment.actualEndTime ? <InfoItem label="Actual end">{formatDateTime(appointment.actualEndTime)}</InfoItem> : null}{appointment.referral ? <InfoItem label="Referral">{appointment.referral.reason}</InfoItem> : null}</dl></section>
    <section className="grid gap-4 md:grid-cols-2"><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-900">Reason for visit</h2><p className="mt-3 text-sm leading-6 text-slate-700">{appointment.reasonForVisit || "Not recorded"}</p></article><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-900">Symptoms</h2><p className="mt-3 text-sm leading-6 text-slate-700">{appointment.symptoms || "Not recorded"}</p></article><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2"><h2 className="text-base font-black text-slate-900">Appointment notes</h2><p className="mt-3 text-sm leading-6 text-slate-700">{appointment.notes || "No appointment notes recorded."}</p></article>{["cancelled", "no_show"].includes(appointment.status) ? <article className="rounded-3xl border border-rose-100 bg-rose-50 p-5 shadow-sm md:col-span-2"><h2 className="text-base font-black text-rose-900">Closed appointment</h2><p className="mt-3 text-sm leading-6 text-rose-800">{appointment.status === "cancelled" ? appointment.cancellationReason || "Cancelled without a recorded reason." : "Marked as a no-show."}</p>{appointment.cancelledAt ? <p className="mt-2 text-xs text-rose-700">Cancelled {formatDateTime(appointment.cancelledAt)}</p> : null}</article> : null}</section>
    <Dialog open={cancelOpen} onOpenChange={setCancelOpen}><DialogContent><DialogHeader><DialogTitle>Cancel appointment</DialogTitle></DialogHeader><form onSubmit={(event) => { event.preventDefault(); runAction("cancel", () => doctorAppointmentsApi.cancel(appointment.id, cancelReason), "Appointment cancelled."); setCancelOpen(false); }} className="space-y-4 p-5"><label className="grid gap-2 text-sm font-medium text-slate-700">Cancellation reason <span className="font-normal text-slate-500">(optional)</span><Input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Reason for cancellation" /></label><DialogFooter><Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>Keep appointment</Button><Button type="submit" variant="destructive" disabled={Boolean(actionLoading)}>Cancel appointment</Button></DialogFooter></form></DialogContent></Dialog>
  </main>;
}

function NoShowButton({ disabled, onConfirm }) {
  return <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" disabled={disabled}><Stethoscope className="h-4 w-4" /> Mark no-show</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Mark this patient as a no-show?</AlertDialogTitle><AlertDialogDescription>This is available only after a confirmed appointment has started and the patient was not checked in.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep appointment</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={onConfirm}>Mark no-show</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
