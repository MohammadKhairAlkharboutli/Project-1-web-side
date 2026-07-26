import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  ListOrdered,
  MapPin,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";

import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getPatientDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";
import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
  sharedSurfaceShell,
} from "@/components/shared/styles";
import { Button } from "@/components/ui/button";

import {
  getCurrentDoctor,
  getCurrentDoctorAppointments,
  getCurrentDoctorScheduleSlots,
} from "./doctorPortalData";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className={profileCardShell}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={profileCardLabel}>{label}</p>
          <p className={profileCardValue}>{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const doctor = getCurrentDoctor();
  const appointments = getCurrentDoctorAppointments();
  const scheduleSlots = getCurrentDoctorScheduleSlots().filter(
    (slot) => slot.isActive !== false,
  );
  const nextAppointments = appointments.slice(0, 4);
  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "confirmed",
  );

  return (
    <div className="space-y-6">
      <section className={sharedSurfaceShell}>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              Welcome back
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {doctor?.user?.full_name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {doctor?.specialization}
              {doctor?.subSpecialization ? ` - ${doctor.subSpecialization}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/doctor/schedule">
                <Clock size={16} />
                Schedule
              </Link>
            </Button>
            <Button asChild>
              <Link to="/doctor/appointments">
                <CalendarDays size={16} />
                Appointments
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Appointments"
          value={appointments.length}
        />
        <StatCard
          icon={Clock}
          label="Confirmed"
          value={confirmedAppointments.length}
        />
        <StatCard
          icon={MapPin}
          label="Active Schedule Slots"
          value={scheduleSlots.length}
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={doctor?.averageRating?.toFixed(1) ?? "N/A"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className={sharedSurfaceShell}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Appointments
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Recent appointments assigned to you.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/doctor/appointments">View all</Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-200">
            {nextAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {getPatientDisplayName(appointment)}
                    </p>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatAppointmentDate(appointment.requestedDate)} at{" "}
                    {formatAppointmentTimeRange(appointment)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-slate-700 hidden sm:block">
                    {appointment.type}
                  </p>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link to="/doctor/queue">
                      <ListOrdered size={14} />
                      Open Queue
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={sharedSurfaceShell}>
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Profile Summary
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Current public-facing doctor details.
            </p>
          </div>

          <div className="space-y-4 p-5 text-sm">
            <div className="flex items-center gap-3">
              <Stethoscope size={18} className="text-slate-500" />
              <span className="font-medium text-slate-800">
                {doctor?.experienceYears} years experience
              </span>
            </div>
            <div className="flex items-center gap-3">
              <UserRound size={18} className="text-slate-500" />
              <span className="font-medium text-slate-800">
                {doctor?.clinics_count} clinics
              </span>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Bio</p>
              <p className="mt-2 leading-6 text-slate-700">{doctor?.bio}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
