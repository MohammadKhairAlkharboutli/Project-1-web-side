import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, LoaderCircle, RefreshCw } from "lucide-react";

import { doctorAppointmentsApi } from "@/api/doctorWorkflowApi";
import DataTable from "@/components/shared/DataTable";
import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import { filterAppointmentsByDate } from "@/components/shared/Appointments/appointmentFilters";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getAppointmentTimePositionLabel,
  getPatientDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useDoctorLocale } from "@/context/DoctorLocaleContext";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In consultation" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

const DATE_MODE_OPTIONS = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "this-week", label: "This week" },
  { value: "custom", label: "Custom range" },
];

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function isWithinCustomRange(appointment, fromDate, toDate) {
  const date = String(appointment.requestedDate || "").slice(0, 10);
  return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
}

function appointmentMatchesSearch(appointment, search) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [getPatientDisplayName(appointment), appointment.patient?.user?.phone]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

function getColumns() {
  return [
    { id: "patient", accessorFn: (appointment) => `${getPatientDisplayName(appointment)} ${appointment.patient?.user?.phone || ""}`, header: "Patient", cell: ({ row }) => <PatientCell appointment={row.original} /> },
    { id: "dateTime", accessorFn: (appointment) => `${appointment.requestedDate} ${appointment.startTime}`, header: "Date & time", cell: ({ row }) => <DateTimeCell appointment={row.original} /> },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <AppointmentPriorityBadge priority={row.original.priority} /> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <div className="space-y-1"><AppointmentStatusBadge status={row.original.status} /><p className="text-xs text-slate-500">{getAppointmentTimePositionLabel(row.original)}</p></div> },
    { id: "actions", header: "Actions", cell: ({ row }) => <DetailsButton appointmentId={row.original.id} /> },
  ];
}

function PatientCell({ appointment }) {
  return <div className="space-y-1"><Link to={`/doctor/patients/${appointment.patientId}?appointmentId=${appointment.id}`} className="font-semibold text-[var(--color-primary)] hover:underline">{getPatientDisplayName(appointment)}</Link><p className="text-xs text-slate-500">{appointment.patient?.user?.phone || "No phone recorded"}</p></div>;
}

function DateTimeCell({ appointment }) {
  return <div className="space-y-1"><p className="font-medium text-slate-900">{formatAppointmentDate(appointment.requestedDate)}</p><p className="text-sm text-slate-500">{formatAppointmentTimeRange(appointment)}</p></div>;
}

function DetailsButton({ appointmentId }) {
  return <Button variant="outline" size="sm" asChild><Link to={`/doctor/appointments/${appointmentId}`}><Eye className="h-4 w-4" /> Details</Link></Button>;
}

function AppointmentFilters({ search, setSearch, status, setStatus, priority, setPriority, dateMode, setDateMode, fromDate, setFromDate, toDate, setToDate, onReset }) {
  const { text } = useDoctorLocale();
  return <div className="space-y-3"><Input className="max-w-sm" placeholder={text("Search patient name or phone...")} value={search} onChange={(event) => setSearch(event.target.value)} /><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><NativeSelect className="w-full sm:w-44" value={status} onChange={(event) => setStatus(event.target.value)}>{STATUS_OPTIONS.map((option) => <NativeSelectOption key={option.value} value={option.value}>{text(option.label)}</NativeSelectOption>)}</NativeSelect><NativeSelect className="w-full sm:w-40" value={priority} onChange={(event) => setPriority(event.target.value)}><NativeSelectOption value="all">{text("All priorities")}</NativeSelectOption><NativeSelectOption value="1">{text("Normal priority")}</NativeSelectOption><NativeSelectOption value="2">{text("High priority")}</NativeSelectOption></NativeSelect><NativeSelect className="w-full sm:w-40" value={dateMode} onChange={(event) => setDateMode(event.target.value)}>{DATE_MODE_OPTIONS.map((option) => <NativeSelectOption key={option.value} value={option.value}>{text(option.label)}</NativeSelectOption>)}</NativeSelect>{dateMode === "custom" ? <><Input type="date" className="w-full sm:w-40" value={fromDate} onChange={(event) => setFromDate(event.target.value)} aria-label={text("Appointments from date")} /><Input type="date" className="w-full sm:w-40" value={toDate} onChange={(event) => setToDate(event.target.value)} aria-label={text("Appointments to date")} /></> : null}<Button variant="outline" onClick={onReset}>{text("Reset filters")}</Button></div></div>;
}

function AppointmentCards({ appointments }) {
  if (!appointments.length) return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">No appointments match these filters.</div>;
  return <div className="space-y-3">{appointments.map((appointment) => <article key={appointment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><PatientCell appointment={appointment} /><AppointmentStatusBadge status={appointment.status} /></div><div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3"><div><p className="text-xs font-medium text-slate-400">Date & time</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatAppointmentDate(appointment.requestedDate)}<br />{formatAppointmentTimeRange(appointment)}</p></div><div><p className="text-xs font-medium text-slate-400">Visit</p><p className="mt-1 text-sm font-semibold text-slate-800">{appointment.type}</p><div className="mt-2"><AppointmentPriorityBadge priority={appointment.priority} /></div></div></div><div className="mt-3 flex justify-end"><DetailsButton appointmentId={appointment.id} /></div></article>)}</div>;
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [dateMode, setDateMode] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoadState("loading");
    setError("");
    try {
      // Status stays client-side until the API accepts the in_progress status filter.
      const params = dateMode === "custom" ? { ...(fromDate ? { from: fromDate } : {}), ...(toDate ? { to: toDate } : {}) } : {};
      const data = await doctorAppointmentsApi.getAppointments(params);
      setAppointments(Array.isArray(data) ? data : []);
      setLoadState("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load appointments."));
      setLoadState("error");
    }
  }, [dateMode, fromDate, toDate]);

  useEffect(() => {
    const timer = window.setTimeout(loadAppointments, 0);
    return () => window.clearTimeout(timer);
  }, [loadAppointments]);

  const standardAppointments = useMemo(() => appointments.filter((appointment) => String(appointment.type || "").toLowerCase() !== "operation"), [appointments]);

  const filteredAppointments = useMemo(() => {
    const dateFiltered = dateMode === "custom" ? standardAppointments.filter((item) => isWithinCustomRange(item, fromDate, toDate)) : filterAppointmentsByDate(standardAppointments, dateMode, "");
    return dateFiltered.filter((appointment) => (status === "all" || appointment.status === status) && (priority === "all" || String(appointment.priority) === priority) && appointmentMatchesSearch(appointment, search));
  }, [dateMode, fromDate, priority, search, standardAppointments, status, toDate]);

  const stats = useMemo(() => ({ total: standardAppointments.length, scheduled: standardAppointments.filter((item) => item.status === "confirmed").length, checkedIn: standardAppointments.filter((item) => item.checkinTime || item.queue).length, completed: standardAppointments.filter((item) => item.status === "completed").length }), [standardAppointments]);

  function resetFilters() {
    setSearch(""); setStatus("all"); setPriority("all"); setDateMode("all"); setFromDate(""); setToDate("");
  }

  return <main className="mx-auto w-full max-w-6xl space-y-6 pb-10"><header className="rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-6 py-7 text-white shadow-lg shadow-blue-500/20 sm:px-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-100">Doctor appointments</p><h1 className="mt-2 text-2xl font-black tracking-tight">Appointments</h1><p className="mt-1 text-sm text-blue-100">Review your scheduled visits and manage today&apos;s check-ins.</p></div><Button variant="secondary" className="self-start bg-white/15 text-white hover:bg-white/25" onClick={loadAppointments} disabled={loadState === "loading"}><RefreshCw className={`h-4 w-4 ${loadState === "loading" ? "animate-spin" : ""}`} /> Refresh</Button></div><div className="mt-6 grid gap-3 sm:grid-cols-4">{[["Total", stats.total], ["Scheduled", stats.scheduled], ["Checked in", stats.checkedIn], ["Completed", stats.completed]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-blue-100">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}</div></header><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><AppointmentFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} priority={priority} setPriority={setPriority} dateMode={dateMode} setDateMode={setDateMode} fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} onReset={resetFilters} />{loadState === "loading" ? <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading appointments…</div> : null}{loadState === "error" ? <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-800"><p>{error}</p><Button className="mt-4" variant="outline" onClick={loadAppointments}>Try again</Button></div> : null}{loadState === "ready" ? <><div className="mt-5 md:hidden"><AppointmentCards appointments={filteredAppointments} /></div><div className="mt-5 hidden md:block"><DataTable columns={getColumns()} data={filteredAppointments} emptyMessage="No appointments match these filters." /></div></> : null}</section></main>;
}
