import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfWeek, format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { Eye, LoaderCircle, RefreshCw } from "lucide-react";

import { doctorAppointmentsApi } from "@/api/doctorWorkflowApi";
import DataTable from "@/components/shared/DataTable";
import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import { formatAppointmentDate, formatAppointmentTimeRange, getAppointmentTimePositionLabel, getPatientDisplayName } from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
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

function dateFiltersForMode(dateMode, fromDate, toDate) {
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  if (dateMode === "today") return { from: todayKey, to: todayKey };
  if (dateMode === "upcoming") return { from: todayKey };
  if (dateMode === "past") return { to: format(subDays(today, 1), "yyyy-MM-dd") };
  if (dateMode === "this-week") return { from: todayKey, to: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd") };
  if (dateMode === "custom") return { ...(fromDate ? { from: fromDate } : {}), ...(toDate ? { to: toDate } : {}) };
  return {};
}

function PatientCell({ appointment }) {
  return <div className="space-y-1"><Link to={`/doctor/patients/${appointment.patientId}?appointmentId=${appointment.id}`} className="font-semibold text-[var(--color-primary)] hover:underline">{getPatientDisplayName(appointment)}</Link><p className="text-xs text-slate-500">{appointment.patient?.user?.phone || "No phone recorded"}</p></div>;
}

function DetailsButton({ appointmentId }) {
  return <Button variant="outline" size="sm" asChild><Link to={`/doctor/appointments/${appointmentId}`}><Eye className="h-4 w-4" /> Details</Link></Button>;
}

function getColumns() {
  return [
    { id: "patient", accessorFn: (appointment) => `${getPatientDisplayName(appointment)} ${appointment.patient?.user?.phone || ""}`, header: "Patient", cell: ({ row }) => <PatientCell appointment={row.original} /> },
    { id: "dateTime", accessorFn: (appointment) => `${appointment.requestedDate} ${appointment.startTime}`, header: "Date & time", cell: ({ row }) => <div className="space-y-1"><p className="font-medium text-slate-900">{formatAppointmentDate(row.original.requestedDate)}</p><p className="text-sm text-slate-500">{formatAppointmentTimeRange(row.original)}</p></div> },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <AppointmentPriorityBadge priority={row.original.priority} /> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <div className="space-y-1"><AppointmentStatusBadge status={row.original.status} /><p className="text-xs text-slate-500">{getAppointmentTimePositionLabel(row.original)}</p></div> },
    { id: "actions", header: "Actions", cell: ({ row }) => <DetailsButton appointmentId={row.original.id} /> },
  ];
}

function AppointmentFilters({ search, onSearchChange, status, onStatusChange, priority, onPriorityChange, dateMode, onDateModeChange, fromDate, onFromDateChange, toDate, onToDateChange, onReset }) {
  const { text } = useDoctorLocale();

  return <div className="space-y-3"><Input appearance="filter" className="max-w-sm" placeholder={text("Search patient name or phone...")} value={search} onChange={(event) => onSearchChange(event.target.value)} /><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"><NativeSelect appearance="filter" className="w-full sm:w-44" value={status} onChange={(event) => onStatusChange(event.target.value)}>{STATUS_OPTIONS.map((option) => <NativeSelectOption key={option.value} value={option.value}>{text(option.label)}</NativeSelectOption>)}</NativeSelect><NativeSelect appearance="filter" className="w-full sm:w-40" value={priority} onChange={(event) => onPriorityChange(event.target.value)}><NativeSelectOption value="all">{text("All priorities")}</NativeSelectOption><NativeSelectOption value="1">{text("Normal priority")}</NativeSelectOption><NativeSelectOption value="2">{text("High priority")}</NativeSelectOption></NativeSelect><NativeSelect appearance="filter" className="w-full sm:w-40" value={dateMode} onChange={(event) => onDateModeChange(event.target.value)}>{DATE_MODE_OPTIONS.map((option) => <NativeSelectOption key={option.value} value={option.value}>{text(option.label)}</NativeSelectOption>)}</NativeSelect>{dateMode === "custom" ? <><label className="w-full text-xs font-medium text-slate-600 sm:w-40">{text("From")}<Input appearance="filter" type="date" className="mt-1" value={fromDate} onChange={(event) => onFromDateChange(event.target.value)} aria-label={text("Appointments from date")} /></label><label className="w-full text-xs font-medium text-slate-600 sm:w-40">{text("To")}<Input appearance="filter" type="date" className="mt-1" value={toDate} onChange={(event) => onToDateChange(event.target.value)} aria-label={text("Appointments to date")} /></label></> : null}<Button variant="outline" appearance="filter" onClick={onReset}>{text("Reset filters")}</Button></div></div>;
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [dateMode, setDateMode] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadAppointments = useCallback(async () => {
    setLoadState("loading");
    setError("");
    try {
      const response = await doctorAppointmentsApi.getAppointments({ page, limit, ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}), ...(status !== "all" ? { status } : {}), ...(priority !== "all" ? { priority } : {}), ...dateFiltersForMode(dateMode, fromDate, toDate) });
      setAppointments(Array.isArray(response?.data) ? response.data : []);
      setTotal(Number(response?.total) || 0);
      setLoadState("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load appointments."));
      setLoadState("error");
    }
  }, [dateMode, debouncedSearch, fromDate, page, priority, status, toDate]);

  useEffect(() => {
    const timer = window.setTimeout(loadAppointments, 0);
    return () => window.clearTimeout(timer);
  }, [loadAppointments]);

  const stats = useMemo(() => ({ total, scheduled: appointments.filter((item) => item.status === "confirmed").length, checkedIn: appointments.filter((item) => item.checkinTime || item.queue).length, completed: appointments.filter((item) => item.status === "completed").length }), [appointments, total]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const updateFilter = (setter, value) => { setter(value); setPage(1); };
  const resetFilters = () => { setSearch(""); setStatus("all"); setPriority("all"); setDateMode("all"); setFromDate(""); setToDate(""); setPage(1); };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <PageHeader
        title="Appointments"
        description="Review your scheduled visits and manage today’s check-ins."
        actions={(
          <Button variant="outline" onClick={loadAppointments} disabled={loadState === "loading"}>
            <RefreshCw className={`h-4 w-4 ${loadState === "loading" ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total matching", stats.total],
          ["Scheduled on page", stats.scheduled],
          ["Checked in on page", stats.checkedIn],
          ["Completed on page", stats.completed],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-card px-4 py-3 shadow-surface">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-slate-200 bg-card p-5 shadow-surface sm:p-6">
        <AppointmentFilters
          search={search}
          onSearchChange={(value) => updateFilter(setSearch, value)}
          status={status}
          onStatusChange={(value) => updateFilter(setStatus, value)}
          priority={priority}
          onPriorityChange={(value) => updateFilter(setPriority, value)}
          dateMode={dateMode}
          onDateModeChange={(value) => updateFilter(setDateMode, value)}
          fromDate={fromDate}
          onFromDateChange={(value) => updateFilter(setFromDate, value)}
          toDate={toDate}
          onToDateChange={(value) => updateFilter(setToDate, value)}
          onReset={resetFilters}
        />

        {loadState === "loading" ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading appointments…
          </div>
        ) : null}

        {loadState === "error" ? (
          <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 p-5 text-sm text-rose-800">
            <p>{error}</p>
            <Button className="mt-4" variant="outline" onClick={loadAppointments}>Try again</Button>
          </div>
        ) : null}

        {loadState === "ready" ? (
          <>
            <div className="mt-5 md:hidden"><AppointmentCards appointments={appointments} /></div>
            <div className="mt-5 hidden md:block">
              <DataTable columns={getColumns()} data={appointments} pagination={false} emptyMessage="No appointments match these filters." />
            </div>
            {total > 0 ? (
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>Showing {(page - 1) * limit + 1}–{(page - 1) * limit + appointments.length} of {total} appointments</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1 || loadState === "loading"} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                  <span className="min-w-20 text-center text-xs font-semibold text-slate-600">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages || loadState === "loading"} onClick={() => setPage((current) => current + 1)}>Next</Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
