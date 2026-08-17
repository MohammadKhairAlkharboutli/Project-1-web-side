import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, User, Phone, Mail, Search, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { doctorAppointmentsApi } from "@/api/doctorWorkflowApi";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getPatientName(patient) {
  const user = patient?.user || {};
  return user.full_name || [user.firstName, user.fatherName, user.lastName].filter(Boolean).join(" ") || "Patient";
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function getPatientId(appointment) {
  return appointment?.patientId ?? appointment?.patient?.id;
}

function getPatientSearchValues(patient) {
  const user = patient?.user ?? {};
  return [
    patient?.id,
    user.full_name,
    user.fullName,
    user.firstName,
    user.fatherName,
    user.lastName,
    user.phone,
    user.email,
  ];
}

function patientsFromAppointments(appointments) {
  const patients = new Map();

  // The old backend returns appointments newest-first. Keep the first visit for
  // each patient so the medical-file link always has an appointment context.
  appointments.forEach((appointment) => {
    const patientId = getPatientId(appointment);
    if (patientId == null || patients.has(String(patientId))) return;

    patients.set(String(patientId), {
      ...(appointment.patient ?? {}),
      id: patientId,
      latestAppointment: appointment,
    });
  });

  return [...patients.values()];
}

export default function PatientsList() {
  const [allPatients, setAllPatients] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const loadPatients = useCallback(async () => {
    setLoadState("loading");
    setError("");
    try {
      const appointments = await doctorAppointmentsApi.getAppointments();
      setAllPatients(patientsFromAppointments(Array.isArray(appointments) ? appointments : []));
      setLoadState("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load your patients."));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadPatients, 0);
    return () => window.clearTimeout(timer);
  }, [loadPatients]);

  const filteredPatients = useMemo(() => {
    const searchTerm = debouncedSearch.trim().toLowerCase();
    if (!searchTerm) return allPatients;

    return allPatients.filter((patient) => (
      getPatientSearchValues(patient).some((value) => (
        String(value ?? "").toLowerCase().includes(searchTerm)
      ))
    ));
  }, [allPatients, debouncedSearch]);
  const total = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const patients = useMemo(
    () => filteredPatients.slice((currentPage - 1) * limit, currentPage * limit),
    [currentPage, filteredPatients],
  );
  const updateSearch = (value) => { setSearchQuery(value); setPage(1); };

  if (loadState === "loading" && !patients.length) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return <div className="min-h-screen space-y-6 bg-slate-100/60 p-4 sm:p-6"><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-xl font-black tracking-tight text-slate-900">Patients List</h1><p className="mt-0.5 text-xs font-medium text-slate-500">Patients are built from appointments assigned to you.</p></div><div className="w-full sm:w-72"><div className="relative"><input type="search" placeholder="Search patient name, phone, or email..." value={searchQuery} onChange={(event) => updateSearch(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200/60 bg-white py-0 pl-11 pr-4 text-left text-xs font-medium text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none" /><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /></div></div></div>{loadState === "error" ? <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><h2 className="font-bold">Patients unavailable</h2><p className="mt-1 text-sm">{error}</p><Button className="mt-4" variant="outline" onClick={loadPatients}><RefreshCw /> Try again</Button></div></div></section> : null}{loadState === "ready" ? <><div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{patients.map((patient) => { const name = getPatientName(patient); const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "P"; const appointment = patient.latestAppointment; return <div key={patient.id} className="flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-5 shadow-xs transition-all hover:shadow-md"><div><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600 shadow-xs">{initials}</div><div><h3 className="text-sm font-bold text-slate-900">{name}</h3><span className="mt-1 inline-block rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">{patient.user?.gender || "Patient"}</span></div></div></div><div className="space-y-2.5 border-t border-slate-100 py-3.5 text-xs font-medium text-slate-600"><div className="flex items-center gap-2.5"><Phone size={14} className="shrink-0 text-slate-400" /><span dir="ltr" className="text-left">{patient.user?.phone || "Not recorded"}</span></div><div className="flex items-center gap-2.5"><Mail size={14} className="shrink-0 text-slate-400" /><span className="truncate">{patient.user?.email || "Not recorded"}</span></div></div></div><div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[11px] font-semibold text-slate-400"><span className="inline-flex items-center gap-1"><CalendarDays size={13} /> Last visit: {formatDate(appointment?.requestedDate)}</span></span><Button variant="ghost" size="sm" className="h-auto gap-1.5 rounded-xl p-2 text-xs font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700" disabled={!appointment?.id} onClick={() => navigate(`/doctor/patients/${patient.id}?appointmentId=${appointment.id}`)}><span>Medical File</span><ChevronRight size={14} /></Button></div></div>; })}</div>{!patients.length ? <div className="rounded-3xl border border-slate-200/60 bg-white py-16 text-center shadow-xs"><User size={36} className="mx-auto mb-2 text-slate-300" /><p className="text-xs font-bold text-slate-600">{searchQuery ? "No matching patients found." : "You do not have any patients with appointments yet."}</p></div> : null}{total > 0 ? <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>Showing {(currentPage - 1) * limit + 1}–{(currentPage - 1) * limit + patients.length} of {total} patients</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</Button><span className="min-w-20 text-center text-xs font-semibold text-slate-600">Page {currentPage} of {totalPages}</span><Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div> : null}</> : null}</div>;
}
