import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Star,
  ArrowUpRight,
  BarChart3,
  Users,
  FileText,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
} from "lucide-react";

import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import {
  formatAppointmentTimeRange,
  getPatientDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";
import { Button } from "@/components/ui/button";

import {
  getCurrentDoctor,
  getCurrentDoctorAppointments,
  getCurrentDoctorScheduleSlots,
} from "./doctorPortalData";

export default function DoctorDashboard() {
  const doctor = getCurrentDoctor();
  const appointments = getCurrentDoctorAppointments();
  const scheduleSlots = getCurrentDoctorScheduleSlots().filter(
    (slot) => slot.isActive !== false
  );
  const nextAppointments = appointments.slice(0, 3);
  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased p-6 lg:p-8" dir="ltr">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Top Section: Welcome Banner & Doctor Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Welcome Banner - تم التعديل إلى التدرج اللوني الجديد */}
          <div className="lg:col-span-8 relative overflow-hidden bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] rounded-[22px] px-6 py-5 text-white shadow-md flex flex-col justify-center">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Clinical Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Welcome back, {doctor?.user?.full_name || "Dr. Doctor"}
              </h1>
              <p className="text-xs text-blue-100 font-medium">
                {doctor?.specialization} {doctor?.subSpecialization ? `— ${doctor.subSpecialization}` : "Healthcare Consultant"} — You have {appointments.length} appointments scheduled today.
              </p>
            </div>
          </div>

          {/* Doctor Profile Card with Avatar */}
          <div className="lg:col-span-4 bg-white rounded-[22px] px-5 py-4 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80" 
                  alt="Doctor Avatar" 
                  className="w-11 h-11 object-cover object-top rounded-xl shadow-xs border border-slate-100"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 text-xs truncate">{doctor?.user?.full_name || "Dr. Doctor"}</h4>
                <p className="text-[11px] text-slate-400 truncate">{doctor?.specialization || "Consultant"}</p>
                <Link to="/doctor/profile" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1e61dc] hover:underline mt-0.5">
                  <span>Profile</span>
                  <ArrowUpRight size={11} className="-rotate-90" />
                </Link>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-[11px]">General Rating</span>
              <span className="font-bold text-amber-500 flex items-center gap-1 text-xs">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {doctor?.averageRating?.toFixed(1) ?? "4.8"}
              </span>
            </div>
          </div>

        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white px-5 py-4 rounded-[22px] border border-slate-100 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-400">Total Appointments</p>
              <p className="text-2xl font-black text-slate-900">{appointments.length}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <TrendingUp size={10} /> +12% weekly
              </span>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-[#1e61dc] flex items-center justify-center shadow-xs">
              <CalendarDays size={18} />
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-[22px] border border-slate-100 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-400">Confirmed Appointments</p>
              <p className="text-2xl font-black text-slate-900">{confirmedAppointments.length}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={10} /> High confirmation rate
              </span>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <FileText size={18} />
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-[22px] border border-slate-100 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-400">Schedule Slots</p>
              <p className="text-2xl font-black text-slate-900">{scheduleSlots.length}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                <Activity size={10} /> Active slots
              </span>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <BarChart3 size={18} />
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-[22px] border border-slate-100 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-400">Active Patients</p>
              <p className="text-2xl font-black text-slate-900">56</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                <Users size={10} /> Active today
              </span>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
              <Users size={18} />
            </div>
          </div>

        </div>

        {/* Bottom Section: Patient Flow & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Patient Flow & Statistics (7 Columns) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Patient Flow & Statistics</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Booking rates and clinical turnout analytics.</p>
                </div>
                <Button asChild className="bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs self-start">
                  <Link to="/doctor/appointments">View All</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs text-slate-400 font-medium truncate">Insurance Patients</p>
                    <p className="text-xl font-black text-slate-900">23 <span className="text-xs font-bold text-slate-500">Patients</span></p>
                  </div>
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-[#1e61dc] flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs text-slate-400 font-medium truncate">Direct Consultations</p>
                    <p className="text-xl font-black text-slate-900">33 <span className="text-xs font-bold text-slate-500">Consultations</span></p>
                  </div>
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-32 w-full bg-slate-50/40 rounded-2xl p-4 flex flex-col justify-end border border-slate-100">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 border-t border-slate-200/60 pt-3">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments (5 Columns) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Upcoming Appointments</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Next bookings for today.</p>
                </div>
                <Link to="/doctor/appointments" className="text-xs font-bold text-[#1e61dc] hover:underline flex items-center gap-1 shrink-0">
                  <span>More</span>
                  <ArrowUpRight size={13} className="-rotate-90" />
                </Link>
              </div>

              <div className="space-y-4">
                {nextAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-extrabold text-slate-900 text-xs">{getPatientDisplayName(appointment)}</p>
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Clock size={13} className="text-[#1e61dc]" />
                        <span>{formatAppointmentTimeRange(appointment)}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-[#1e61dc] border border-blue-100 shrink-0">
                      {appointment.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button asChild className="w-full bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition-all">
              <Link to="/doctor/appointments">Manage All Appointments</Link>
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}