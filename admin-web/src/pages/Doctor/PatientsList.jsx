// File: PatientsList.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, User, Phone, Mail, Search, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { doctorAppointmentsApi } from "@/api/doctorWorkflowApi";

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getPatientName(appointment) {
  const user = appointment?.patient?.user;
  return user?.full_name || [user?.firstName, user?.fatherName, user?.lastName].filter(Boolean).join(" ") || "Patient";
}

function getPatientId(appointment) {
  return appointment?.patientId ?? appointment?.patient?.id;
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const loadPatients = useCallback(async () => {
    setLoadState("loading");
    setError("");
    try {
      const appointments = await doctorAppointmentsApi.getAppointments();
      const byPatientId = new Map();
      (Array.isArray(appointments) ? appointments : []).forEach((appointment) => {
        const patientId = getPatientId(appointment);
        if (patientId && !byPatientId.has(String(patientId))) {
          byPatientId.set(String(patientId), { patientId, appointment, user: appointment.patient?.user || {} });
        }
      });
      setPatients([...byPatientId.values()]);
      setLoadState("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load patients from your appointments."));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadPatients, 0);
    return () => window.clearTimeout(timer);
  }, [loadPatients]);

  const filteredPatients = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return patients;
    return patients.filter(({ appointment, user }) => [getPatientName(appointment), user.phone, user.email].some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [patients, searchQuery]);

  if (loadState === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-100/60 p-4 sm:p-6 min-h-screen">
      {/* Page Header and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Patients List</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Patients from your appointments and their available medical records
          </p>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-left"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {loadState === "error" ? <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><h2 className="font-bold">Patients unavailable</h2><p className="mt-1 text-sm">{error}</p><Button className="mt-4" variant="outline" onClick={loadPatients}><RefreshCw /> Try again</Button></div></div></section> : null}

      {loadState === "ready" ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map(({ patientId, appointment, user }) => {
          const name = getPatientName(appointment);
          const initials = name
            ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            : "P";

          return (
            <div
              key={patientId}
              className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-sm font-bold shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{name}</h3>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                        {user.gender || "Patient"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 py-3.5 border-t border-slate-100 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span dir="ltr" className="text-left">{user.phone || "Not recorded"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{user.email || "Not recorded"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-400 font-semibold">
                  <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> Last visit: {formatDate(appointment.requestedDate)}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl gap-1.5 p-2 h-auto"
                  onClick={() => navigate(`/doctor/patients/${patientId}?appointmentId=${appointment.id}`)}
                >
                  <span>Medical File</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div> : null}

      {filteredPatients.length === 0 && loadState === "ready" && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/60 shadow-xs">
          <User size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">{patients.length ? "No matching patients found." : "You do not have any appointments yet."}</p>
        </div>
      )}
    </div>
  );
}
