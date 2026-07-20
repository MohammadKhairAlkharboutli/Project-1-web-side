import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Database,
  Flag,
  Hospital,
  ListOrdered,
  Scale,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatRatingDate,
  getCommentPreview,
  getRatingDoctorName,
  getReportReasonLabel,
} from "@/components/shared/Ratings/ratingUtils";
import { mockRatingReports } from "@/components/shared/Ratings/mockRatingData";
import { mockAppointments } from "@/components/shared/Appointments/mockAppointmentData";

import { clinics } from "./ClinicData";
import { doctors } from "./DoctorData";
import {
  formatClinicStatus,
  getClinicStatusVariant,
} from "./Clinics/clinicUtils";
import {
  formatDoctorStatus,
  getDoctorDisplayName,
} from "./Doctors/doctorUtils";
import { mockScheduleChangeRequests } from "./ScheduleChangeRequests/mockScheduleChangeRequests";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getScheduleGroupKey(request) {
  return [
    request.doctorProfileId,
    request.clinicId,
    request.dayOfWeek,
  ].join("-");
}

function getDoctorById(doctorId) {
  return doctors.find((doctor) => Number(doctor.id) === Number(doctorId));
}

function getClinicById(clinicId) {
  return clinics.find((clinic) => Number(clinic.id) === Number(clinicId));
}

function getAppointmentDayOfWeek(appointment) {
  return new Date(`${appointment.requestedDate}T00:00:00`).getDay();
}

function countAffectedAppointments(group) {
  return mockAppointments.filter((appointment) => {
    const sameDoctor = Number(appointment.doctorId) === Number(group.doctor.id);
    const sameClinic = Number(appointment.clinicId) === Number(group.clinic.id);
    const sameDay = getAppointmentDayOfWeek(appointment) === group.dayOfWeek;

    return appointment.status === "confirmed" && sameDoctor && sameClinic && sameDay;
  }).length;
}

function buildPendingScheduleGroups() {
  const groupsByKey = new Map();

  mockScheduleChangeRequests
    .filter((request) => request.status === "PENDING")
    .forEach((request) => {
      const key = getScheduleGroupKey(request);
      const currentGroup = groupsByKey.get(key);

      if (currentGroup) {
        currentGroup.slots.push(request);
        return;
      }

      const doctor = getDoctorById(request.doctorProfileId) || {
        id: request.doctorProfileId,
        user: { full_name: "Unknown doctor" },
      };
      const clinic = getClinicById(request.clinicId) || {
        id: request.clinicId,
        name: "Unknown clinic",
      };

      groupsByKey.set(key, {
        key,
        doctor,
        clinic,
        dayOfWeek: request.dayOfWeek,
        slots: [request],
      });
    });

  return Array.from(groupsByKey.values()).map((group) => ({
    ...group,
    affectedAppointmentsCount: countAffectedAppointments(group),
  }));
}

function formatSlotTime(value) {
  return String(value || "").slice(0, 5) || "N/A";
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const pendingScheduleGroups = buildPendingScheduleGroups();
const pendingRatingReports = mockRatingReports.filter(
  (report) => report.status === "pending",
);
const clinicStatusIssues = clinics.filter((clinic) => clinic.status !== "active");
const doctorStatusIssues = doctors.filter(
  (doctor) => doctor.status !== "ACTIVE" || !doctor.isApproved,
);

const summaryCards = [
  {
    label: "Schedule change groups",
    value: pendingScheduleGroups.length,
    helper: `${pluralize(
      mockScheduleChangeRequests.filter((request) => request.status === "PENDING").length,
      "pending slot",
    )} waiting for a decision`,
    to: "/admin/schedule-change-requests",
    icon: CalendarClock,
  },
  {
    label: "Rating reports",
    value: pendingRatingReports.length,
    helper: "Pending patient reports about public ratings",
    to: "/admin/rating-reports",
    icon: Flag,
  },
  {
    label: "Clinic records",
    value: clinicStatusIssues.length,
    helper: "Clinics marked maintenance or closed",
    to: "/admin/clinics",
    icon: Hospital,
  },
  {
    label: "Doctor records",
    value: doctorStatusIssues.length,
    helper: "Doctors not active or not approved",
    to: "/admin/doctors",
    icon: Stethoscope,
  },
];

const quickActions = [
  { label: "Doctors", to: "/admin/doctors", icon: Stethoscope },
  { label: "Patients", to: "/admin/patients", icon: Users },
  { label: "Appointments", to: "/admin/appointments", icon: CalendarDays },
  { label: "Queue", to: "/admin/queue", icon: ListOrdered },
  { label: "Ratings", to: "/admin/ratings", icon: Star },
  { label: "Rating Reports", to: "/admin/rating-reports", icon: Flag },
  { label: "Schedule Requests", to: "/admin/schedule-change-requests", icon: CalendarClock },
  { label: "Data Lookups", to: "/admin/data-lookups", icon: Database },
  { label: "System Policies", to: "/admin/system-policies", icon: Scale },
];

function SummaryCard({ card }) {
  const Icon = card.icon;

  return (
    <Link
      to={card.to}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {card.value}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-500">{card.helper}</p>
    </Link>
  );
}

function Section({ title, description, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ScheduleRequestRow({ group }) {
  const firstSlot = group.slots[0];
  const lastSlot = group.slots[group.slots.length - 1];

  return (
    <Link
      to="/admin/schedule-change-requests"
      className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_170px_130px]"
    >
      <div>
        <p className="font-medium text-slate-900">
          {getDoctorDisplayName(group.doctor)}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {group.clinic.name} - {DAY_NAMES[group.dayOfWeek] ?? "Unknown day"}
        </p>
      </div>
      <p className="text-sm text-slate-600">
        {formatSlotTime(firstSlot?.startTime)} - {formatSlotTime(lastSlot?.endTime)}
      </p>
      <Badge variant={group.affectedAppointmentsCount ? "destructive" : "outline"}>
        {pluralize(group.affectedAppointmentsCount, "affected visit")}
      </Badge>
    </Link>
  );
}

function RatingReportRow({ report }) {
  return (
    <Link
      to={`/admin/rating-reports/${report.id}`}
      className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_160px_110px]"
    >
      <div>
        <p className="font-medium text-slate-900">
          {getReportReasonLabel(report.reason)}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {getCommentPreview(report.rating?.comment, 90)}
        </p>
      </div>
      <p className="text-sm text-slate-600">
        {getRatingDoctorName(report.rating)}
      </p>
      <p className="text-sm text-slate-500">{formatRatingDate(report.createdAt)}</p>
    </Link>
  );
}

function DoctorStatusRow({ doctor }) {
  return (
    <Link
      to={`/admin/doctors/${doctor.id}`}
      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
    >
      <div>
        <p className="font-medium text-slate-900">{getDoctorDisplayName(doctor)}</p>
        <p className="mt-0.5 text-sm text-slate-500">{doctor.specialization}</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {!doctor.isApproved ? <Badge variant="outline">Pending approval</Badge> : null}
        <Badge variant={doctor.status === "ACTIVE" ? "default" : "secondary"}>
          {formatDoctorStatus(doctor.status)}
        </Badge>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          A focused admin overview using records that already exist in this application.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} card={card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Section
          title="Pending Schedule Changes"
          description="Grouped the same way as the Schedule Change Requests page."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/schedule-change-requests">
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y divide-slate-100">
            {pendingScheduleGroups.length ? (
              pendingScheduleGroups
                .slice(0, 4)
                .map((group) => <ScheduleRequestRow key={group.key} group={group} />)
            ) : (
              <p className="px-5 py-6 text-sm text-slate-500">
                No pending schedule change requests.
              </p>
            )}
          </div>
        </Section>

        <Section title="Quick Actions">
          <div className="grid gap-3 p-5">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Button
                  key={action.to}
                  asChild
                  variant="outline"
                  className="h-11 justify-between"
                >
                  <Link to={action.to}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Pending Rating Reports"
          description="Reports that are still pending on the Rating Reports page."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/rating-reports">
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y divide-slate-100">
            {pendingRatingReports.length ? (
              pendingRatingReports.map((report) => (
                <RatingReportRow key={report.id} report={report} />
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-slate-500">
                No pending rating reports.
              </p>
            )}
          </div>
        </Section>

        <Section
          title="Doctor Records To Check"
          description="Only doctors that are inactive, on leave, or pending approval."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/doctors">
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y divide-slate-100">
            {doctorStatusIssues.length ? (
              doctorStatusIssues.map((doctor) => (
                <DoctorStatusRow key={doctor.id} doctor={doctor} />
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-slate-500">
                All doctor records are active and approved.
              </p>
            )}
          </div>
        </Section>
      </div>

      <Section
        title="Clinic Status"
        description="Clinic records exactly as they appear in the Clinics page."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/clinics">
              Open
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-3 p-5 md:grid-cols-2">
          {clinics.map((clinic) => (
            <Link
              key={clinic.id}
              to={`/admin/clinics/${clinic.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div>
                <p className="font-medium text-slate-900">{clinic.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">{clinic.location}</p>
              </div>
              <Badge variant={getClinicStatusVariant(clinic.status)}>
                {formatClinicStatus(clinic.status)}
              </Badge>
            </Link>
          ))}
        </div>
      </Section>
    </section>
  );
}
