import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, FileText, LoaderCircle, RefreshCw, Stethoscope, XCircle } from "lucide-react";

import { doctorAppointmentsApi } from "@/api/doctorWorkflowApi";
import CancelAppointmentDialog from "@/components/shared/Appointments/CancelAppointmentDialog";
import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import { formatAppointmentDate, formatAppointmentTimeRange, formatDateTime, getPriorityLabel, parseAppointmentDateTime } from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function InfoItem({ label, children }) {
  return <div className="rounded-lg border border-slate-200 bg-muted/60 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium leading-6 text-slate-800">{children || "Not recorded"}</dd></div>;
}

function canCancelFutureAppointment(appointment) {
  if (!appointment || !["pending", "confirmed"].includes(appointment.status)) {
    return false;
  }
  const scheduledStart = parseAppointmentDateTime(
    appointment.requestedDate,
    appointment.startTime,
  );
  return Boolean(scheduledStart && scheduledStart > new Date());
}

function localDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function hasActiveQueueEntry(appointment) {
  const queueStatus = appointment?.queue?.status;
  return (
    ["waiting", "calling", "in_progress"].includes(queueStatus) &&
    String(appointment?.requestedDate || "").slice(0, 10) === localDateString()
  );
}

export default function DoctorAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState("");
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

  function updateCancelDialog(open) {
    if (actionLoading) {
      return;
    }

    setCancelOpen(open);
    if (!open) {
      setCancelError("");
    }
  }

  async function cancelAppointment(cancellationReason) {
    if (!appointment || actionLoading) {
      return;
    }

    setActionLoading("cancel");
    setNotice("");
    setCancelError("");
    try {
      await doctorAppointmentsApi.cancel(appointment.id, cancellationReason);
      await loadAppointment();
      setCancelOpen(false);
      setNotice("Appointment cancelled. Any eligible held payment was refunded.");
      return true;
    } catch (actionError) {
      setCancelError(getErrorMessage(actionError, "The appointment could not be cancelled."));
      return false;
    } finally {
      setActionLoading("");
    }
  }

  const queueStatus = appointment?.queue?.status;
  const isOperation = String(appointment?.type || "").toLowerCase() === "operation";
  const canCancel = useMemo(() => canCancelFutureAppointment(appointment), [appointment]);
  const hasActiveQueue = useMemo(() => hasActiveQueueEntry(appointment), [appointment]);
  const canResumeConsultation = hasActiveQueue && queueStatus === "in_progress" && Boolean(appointment?.actualStartTime);

  if (loadState === "loading") return <section className="mx-auto flex w-full max-w-4xl items-center justify-center gap-2 rounded-lg border border-slate-200 bg-card p-12 text-sm font-medium text-muted-foreground shadow-surface"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading appointment…</section>;
  if (loadState === "error") return <section className="mx-auto w-full max-w-4xl rounded-lg border border-rose-200 bg-rose-50 p-8 text-rose-800"><h1 className="text-lg font-semibold">Appointment unavailable</h1><p className="mt-2 text-sm">{error}</p><div className="mt-5 flex gap-3"><Button onClick={loadAppointment}>Try again</Button><Button variant="outline" onClick={() => navigate("/doctor/appointments")}>Back to appointments</Button></div></section>;
  if (isOperation) return <section className="mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-card p-8 text-center shadow-surface"><Stethoscope className="mx-auto h-9 w-9 text-primary" /><h1 className="mt-4 text-xl font-semibold text-slate-900">Manage this from Operations</h1><p className="mt-2 text-sm leading-6 text-slate-600">Operations use their own payment and completion workflow. They cannot be checked in, sent to the queue, or opened as a consultation.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild><Link to="/doctor/appointments?tab=operations">Open Operations</Link></Button><Button variant="outline" asChild><Link to={`/doctor/patients/${appointment.patientId}?appointmentId=${appointment.id}`}>Open medical file</Link></Button></div></section>;

  return <main className="mx-auto w-full max-w-5xl space-y-6 pb-10"><PageHeader title={appointment.patient?.user?.full_name || [appointment.patient?.user?.firstName, appointment.patient?.user?.lastName].filter(Boolean).join(" ") || "Patient"} description={`Appointment #${appointment.id} · ${formatAppointmentDate(appointment.requestedDate)} · ${formatAppointmentTimeRange(appointment)}`} actions={<><AppointmentStatusBadge status={appointment.status} /><AppointmentPriorityBadge priority={appointment.priority} /><Button variant="outline" size="sm" onClick={() => navigate("/doctor/appointments")}><ArrowLeft className="h-4 w-4" /> Back</Button></>} />
    {notice ? <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}{error ? <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</p> : null}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black text-slate-900">Visit actions</h2><p className="mt-1 text-sm text-slate-500">Review appointment information and continue through the live queue after the patient is checked in.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link to={`/doctor/patients/${appointment.patientId}?appointmentId=${appointment.id}`}><FileText className="h-4 w-4" /> Medical file</Link></Button>{hasActiveQueue ? <Button asChild><Link to={canResumeConsultation ? `/doctor/consultation/${appointment.id}` : "/doctor/queue"}><ClipboardList className="h-4 w-4" /> {canResumeConsultation ? "Resume consultation" : "Open queue"}</Link></Button> : null}{canCancel ? <Button variant="outline" disabled={Boolean(actionLoading)} onClick={() => setCancelOpen(true)}><XCircle className="h-4 w-4" /> Cancel</Button> : null}<Button variant="outline" size="icon" disabled={loadState === "loading"} onClick={loadAppointment} aria-label="Refresh appointment"><RefreshCw className="h-4 w-4" /></Button></div></div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><InfoItem label="Patient">{appointment.patient?.user?.full_name || [appointment.patient?.user?.firstName, appointment.patient?.user?.lastName].filter(Boolean).join(" ")}</InfoItem><InfoItem label="Phone">{appointment.patient?.user?.phone}</InfoItem><InfoItem label="Clinic">{appointment.clinic?.name}</InfoItem><InfoItem label="Date">{formatAppointmentDate(appointment.requestedDate)}</InfoItem><InfoItem label="Time">{formatAppointmentTimeRange(appointment)}</InfoItem><InfoItem label="Visit type">{appointment.type}</InfoItem><InfoItem label="Priority">{getPriorityLabel(appointment.priority)}</InfoItem><InfoItem label="Checked in">{formatDateTime(appointment.checkinTime)}</InfoItem><InfoItem label="Queue">{appointment.queue ? String(appointment.queue.status).replaceAll("_", " ") : "Not checked in"}</InfoItem>{appointment.actualStartTime ? <InfoItem label="Actual start">{formatDateTime(appointment.actualStartTime)}</InfoItem> : null}{appointment.actualEndTime ? <InfoItem label="Actual end">{formatDateTime(appointment.actualEndTime)}</InfoItem> : null}{appointment.referral ? <InfoItem label="Referral">{appointment.referral.reason}</InfoItem> : null}</dl></section>
    <section className="grid gap-4 md:grid-cols-2"><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-900">Reason for visit</h2><p className="mt-3 text-sm leading-6 text-slate-700">{appointment.reasonForVisit || "Not recorded"}</p></article><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-900">Symptoms</h2><p className="mt-3 text-sm leading-6 text-slate-700">{appointment.symptoms || "Not recorded"}</p></article><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2"><h2 className="text-base font-black text-slate-900">Appointment notes</h2><p className="mt-3 text-sm leading-6 text-slate-700">{appointment.notes || "No appointment notes recorded."}</p></article>{["cancelled", "no_show"].includes(appointment.status) ? <article className="rounded-3xl border border-rose-100 bg-rose-50 p-5 shadow-sm md:col-span-2"><h2 className="text-base font-black text-rose-900">Closed appointment</h2><p className="mt-3 text-sm leading-6 text-rose-800">{appointment.status === "cancelled" ? appointment.cancellationReason || "Cancelled without a recorded reason." : "Marked as a no-show."}</p>{appointment.cancelledAt ? <p className="mt-2 text-xs text-rose-700">Cancelled {formatDateTime(appointment.cancelledAt)}</p> : null}</article> : null}</section>
    <CancelAppointmentDialog appointment={appointment} open={cancelOpen} isCancelling={Boolean(actionLoading)} error={cancelError} onOpenChange={updateCancelDialog} onConfirm={cancelAppointment} />
  </main>;
}

