import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock, Star, Users } from "lucide-react";

import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import { formatAppointmentTimeRange, getPatientDisplayName } from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";

import { getCurrentDoctor, getCurrentDoctorAppointments } from "./doctorPortalData";
import { getMockDoctorQueue } from "./doctorMockWorkflow";

function toLocalDateString(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isInCurrentWeek(dateValue) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  return date >= weekStart && date <= weekEnd;
}

export default function DoctorDashboard() {
  const doctor = getCurrentDoctor();
  const appointments = getCurrentDoctorAppointments();
  const queue = getMockDoctorQueue();
  const today = toLocalDateString();
  const nextAppointments = appointments
    .filter((appointment) => ["confirmed", "in_progress"].includes(appointment.status) && appointment.requestedDate >= today)
    .sort((left, right) => `${left.requestedDate} ${left.startTime}`.localeCompare(`${right.requestedDate} ${right.startTime}`))
    .slice(0, 3);

  const stats = [
    { label: "Appointments Today", value: appointments.filter((item) => item.requestedDate === today && item.status !== "cancelled").length, helper: "Today's booked visits", icon: CalendarDays, iconClass: "bg-blue-50 text-[#1e61dc]", helperClass: "bg-blue-50 text-blue-600" },
    { label: "Appointments This Week", value: appointments.filter((item) => item.status !== "cancelled" && isInCurrentWeek(item.requestedDate)).length, helper: "Current week", icon: CalendarDays, iconClass: "bg-emerald-50 text-emerald-600", helperClass: "bg-emerald-50 text-emerald-600" },
    { label: "Patients Waiting", value: queue.filter((item) => item.status === "waiting").length, helper: "In the live queue", icon: Users, iconClass: "bg-amber-50 text-amber-600", helperClass: "bg-amber-50 text-amber-600" },
    { label: "Completed Today", value: appointments.filter((item) => item.status === "completed" && toLocalDateString(item.actualEndTime || item.requestedDate) === today).length, helper: "Finished consultations", icon: CheckCircle2, iconClass: "bg-purple-50 text-purple-600", helperClass: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 font-sans text-slate-900 antialiased lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          <div className="relative flex flex-col justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-6 py-5 text-white shadow-md lg:col-span-8">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 space-y-1.5"><span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />Clinical Dashboard</span><h1 className="text-xl font-black tracking-tight sm:text-2xl">Welcome back, {doctor?.user?.full_name || "Doctor"}</h1><p className="text-xs font-medium text-blue-100">You have {stats[0].value} appointments today.</p></div>
          </div>
          <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white px-5 py-4 shadow-xs lg:col-span-4"><div className="flex items-center gap-3.5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">{doctor?.user?.full_name?.replace(/^Dr\.?\s+/i, "").split(" ").filter(Boolean).slice(0, 2).map((name) => name[0]).join("") || "D"}</div><div className="min-w-0 flex-1"><h4 className="truncate text-xs font-extrabold text-slate-900">{doctor?.user?.full_name || "Doctor"}</h4><p className="truncate text-[11px] text-slate-400">{doctor?.specialization || "Consultant"}</p><Link to="/doctor/profile" className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#1e61dc] hover:underline">Profile <ArrowUpRight size={11} className="-rotate-90" /></Link></div></div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500"><span className="text-[11px] font-medium">General Rating</span><span className="flex items-center gap-1 text-xs font-bold text-amber-500"><Star size={12} className="fill-amber-400 text-amber-400" />{doctor?.averageRating?.toFixed(1) ?? "4.8"}</span></div></div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-100 bg-white px-5 py-4 shadow-xs"><div className="space-y-0.5"><p className="text-[11px] font-semibold text-slate-400">{stat.label}</p><p className="text-2xl font-black text-slate-900">{stat.value}</p><span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${stat.helperClass}`}>{stat.helper}</span></div><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${stat.iconClass}`}><Icon size={18} /></div></div>; })}</div>

        <section className="flex flex-col justify-between space-y-6 rounded-[24px] border border-slate-100 bg-white p-6 shadow-xs sm:p-8"><div><div className="mb-4 flex items-center justify-between"><div><h3 className="text-base font-black text-slate-900">Upcoming Appointments</h3><p className="mt-0.5 text-xs text-slate-400">Your next scheduled visits.</p></div><Link to="/doctor/appointments" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#1e61dc] hover:underline">More <ArrowUpRight size={13} className="-rotate-90" /></Link></div><div className="grid gap-4 lg:grid-cols-3">{nextAppointments.length ? nextAppointments.map((appointment) => <div key={appointment.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100/80 bg-slate-50/50 p-4"><div className="min-w-0 flex-1 space-y-1.5"><div className="flex flex-wrap items-center gap-2.5"><p className="text-xs font-extrabold text-slate-900">{getPatientDisplayName(appointment)}</p><AppointmentStatusBadge status={appointment.status} /></div><p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Clock size={13} className="text-[#1e61dc]" />{formatAppointmentTimeRange(appointment)}</p></div><span className="shrink-0 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1e61dc]">{appointment.type}</span></div>) : <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 lg:col-span-3">No upcoming appointments.</p>}</div></div><Button asChild className="w-full rounded-xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] py-3.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90"><Link to="/doctor/appointments">Manage All Appointments</Link></Button></section>
      </div>
    </div>
  );
}
