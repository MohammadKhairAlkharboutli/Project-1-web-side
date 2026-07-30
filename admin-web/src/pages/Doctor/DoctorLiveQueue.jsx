import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, FileText, ListOrdered, LoaderCircle, Play, RefreshCw, SkipForward, Stethoscope, Users } from "lucide-react";

import { doctorQueueApi } from "@/api/doctorWorkflowApi";
import { DoctorClinicAssignmentContext } from "@/context/DoctorClinicAssignmentContext";
import { clearCallingQueueBridge, getCallingQueueBridge, saveCallingQueueBridge } from "./doctorQueueBridge";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getPatientName(item) {
  const user = item.appointment?.patient?.user;
  const name = user?.full_name || [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return name || `Patient #${item.appointment?.patientId || item.appointment?.patient?.id || "—"}`;
}

function getStatusBadge(status) {
  const styles = { waiting: "border-amber-200 bg-amber-50 text-amber-700", calling: "border-blue-200 bg-blue-50 text-blue-700", in_progress: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  const labels = { waiting: "Waiting", calling: "Calling", in_progress: "In consultation" };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles[status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>{labels[status] || status}</span>;
}

export default function DoctorLiveQueue() {
  const navigate = useNavigate();
  const { assignedClinic } = useContext(DoctorClinicAssignmentContext) || {};
  const [queue, setQueue] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [action, setAction] = useState("");

  const loadQueue = useCallback(async () => {
    setLoadState("loading");
    setError("");
    try {
      const data = await doctorQueueApi.getMyQueue();
      const liveQueue = Array.isArray(data) ? data : [];
      const callingBridge = getCallingQueueBridge();
      const nextQueue = callingBridge && !liveQueue.some((item) => String(item.id) === String(callingBridge.id))
        ? [...liveQueue, callingBridge]
        : liveQueue;
      setQueue(nextQueue);
      setLoadState("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load today’s queue."));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadQueue, 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  const activeQueue = useMemo(() => queue.filter((item) => ["waiting", "calling", "in_progress"].includes(item.status)), [queue]);
  const waitingPatients = activeQueue.filter((item) => item.status === "waiting");
  const callingPatient = activeQueue.find((item) => item.status === "calling");
  const inProgressPatient = activeQueue.find((item) => item.status === "in_progress");
  const activePatient = callingPatient || inProgressPatient;
  const canCallNext = Boolean(waitingPatients.length) && !activePatient && assignedClinic?.id;

  async function run(name, request, successMessage, afterSuccess) {
    setAction(name);
    setMessage("");
    setError("");
    try {
      const result = await request();
      await afterSuccess?.(result);
      setMessage(successMessage);
      await loadQueue();
      return result;
    } catch (requestError) {
      setError(getErrorMessage(requestError, "The queue could not be updated."));
      return null;
    } finally {
      setAction("");
    }
  }

  async function callNext() {
    await run("call", () => doctorQueueApi.callNext(assignedClinic.id), "The next patient is now being called.", async (entry) => {
      saveCallingQueueBridge({ ...entry, status: "calling" });
    });
  }

  async function startConsultation(item) {
    const started = await run("start", () => doctorQueueApi.startConsultation(item.id), "Consultation started.", async () => clearCallingQueueBridge(item.id));
    if (started) navigate(`/doctor/consultation/${item.appointmentId}`);
  }

  async function skipPatient(item) {
    await run(`skip-${item.id}`, () => doctorQueueApi.skip(item.id), `${getPatientName(item)} was skipped.`, async () => clearCallingQueueBridge(item.id));
  }

  if (loadState === "loading") return <section className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white p-14 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading queue…</section>;
  if (loadState === "error") return <section className="mx-auto w-full max-w-6xl rounded-3xl border border-rose-100 bg-rose-50 p-7 text-rose-800"><h1 className="font-bold">Queue unavailable</h1><p className="mt-2 text-sm">{error}</p><button type="button" onClick={loadQueue} className="mt-5 inline-flex items-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-bold text-white">Try again</button></section>;

  return <div className="mx-auto w-full max-w-6xl space-y-6 pb-10"><header className="rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-6 py-6 text-white shadow-lg shadow-blue-500/20 sm:px-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide"><ListOrdered size={14} /> Live queue</div><h1 className="mt-3 text-2xl font-black tracking-tight">Today&apos;s Patient Queue</h1><p className="mt-1 text-sm text-blue-100">Only checked-in appointments appear here.</p></div><button type="button" onClick={loadQueue} className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/25"><RefreshCw size={15} /> Refresh</button></div></header>
    {callingPatient && String(getCallingQueueBridge()?.id) === String(callingPatient.id) ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">The backend does not return a patient while they are being called yet. This temporary browser-session entry lets you start or skip them; do not clear browser session data before finishing this handoff.</p> : null}
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="Waiting" value={waitingPatients.length} tone="text-slate-900" /><Metric label="In consultation" value={inProgressPatient ? 1 : 0} tone="text-emerald-600" /><Metric label="Active queue" value={activeQueue.length} tone="text-blue-600" /></div>
    {message ? <p aria-live="polite" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</p> : null}{error ? <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</p> : null}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Current patient</p>{activePatient ? <div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-slate-900">{getPatientName(activePatient)}</h2>{getStatusBadge(activePatient.status)}</div> : <h2 className="mt-1 text-lg font-black text-slate-900">No patient is currently active</h2>}</div>{callingPatient ? <div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(action)} onClick={() => startConsultation(callingPatient)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"><Play size={17} /> {action === "start" ? "Starting…" : "Start consultation"}</button><button type="button" disabled={Boolean(action)} onClick={() => skipPatient(callingPatient)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-5 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"><SkipForward size={17} /> Skip</button></div> : null}{inProgressPatient ? <button type="button" onClick={() => navigate(`/doctor/consultation/${inProgressPatient.appointmentId}`)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"><Stethoscope size={17} /> Resume consultation</button> : null}</div></section>
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-lg font-black text-slate-900">Waiting queue</h2><p className="mt-1 text-sm text-slate-500">Your assigned clinic: {assignedClinic?.name || "Clinic not available"}</p></div><button type="button" onClick={callNext} disabled={!canCallNext || Boolean(action)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"><Bell size={17} /> {action === "call" ? "Calling…" : canCallNext ? "Call next patient" : activePatient ? "Patient already active" : "No patients waiting"}</button></div>{waitingPatients.length ? <div className="divide-y divide-slate-100">{waitingPatients.map((item) => <article key={item.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex min-w-0 items-center gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-700">{item.position}</span><div className="min-w-0"><h3 className="truncate text-sm font-bold text-slate-900">{getPatientName(item)}</h3><p className="mt-0.5 text-xs text-slate-500">{item.appointment?.type || "Visit"} · estimated wait {item.estimatedWaitMinutes ?? 0} min</p></div></div><div className="flex items-center gap-2"><button type="button" onClick={() => navigate(`/doctor/patients/${item.appointment?.patientId || item.appointment?.patient?.id}?appointmentId=${item.appointmentId || item.appointment?.id}`)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100" title="Open medical file" aria-label={`Open ${getPatientName(item)} medical file`}><FileText size={17} /></button><button type="button" disabled={Boolean(action)} onClick={() => skipPatient(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition hover:bg-amber-100 disabled:opacity-50" title="Skip patient" aria-label={`Skip ${getPatientName(item)}`}><SkipForward size={17} /></button></div></article>)}</div> : <div className="px-6 py-14 text-center"><Users className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No patients are waiting.</p><p className="mt-1 text-sm text-slate-500">Check in a confirmed appointment from its details page.</p></div>}</section></div>;
}

function Metric({ label, value, tone }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p></div>;
}
