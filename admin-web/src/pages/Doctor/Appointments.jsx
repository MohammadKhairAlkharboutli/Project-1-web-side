import { useMemo, useState } from "react";
import DataTable from "@/components/shared/DataTable";
import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import AppointmentStatusBadge from "@/components/shared/Appointments/AppointmentStatusBadge";
import Dropdown from "@/components/old-UI/Dropdown";
import {
  APPOINTMENT_STATUS_OPTIONS,
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getClinicName,
  getPatientDisplayName,
} from "@/components/shared/Appointments/appointmentUtils";
import { Input } from "@/components/ui/input";

const getAllTestDoctorAppointments = () => [
  {
    id: "app-1",
    patient: { user: { firstName: "Layla", lastName: "Hassan" } },
    phone: "+1 (555) 201-3478",
    requestedDate: "2026-07-04",
    startTime: "09:00",
    endTime: "09:30",
    clinic: { name: "Downtown Clinic" },
    type: "Initial Visit",
    priority: "1",
    status: "confirmed",
  },
  {
    id: "app-2",
    patient: { user: { firstName: "Daniel", lastName: "Murphy" } },
    phone: "+1 (555) 415-9821",
    requestedDate: "2026-07-01",
    startTime: "11:00",
    endTime: "11:30",
    clinic: { name: "Downtown Clinic" },
    type: "Return Visit",
    priority: "2",
    status: "pending",
  },
  {
    id: "app-3",
    patient: { user: { firstName: "Sarah", lastName: "Jenkins" } },
    phone: "+1 (555) 789-1234",
    requestedDate: "2026-06-18",
    startTime: "13:00",
    endTime: "13:30",
    clinic: { name: "Bayview Clinic" },
    type: "Return Visit",
    priority: "1",
    status: "completed",
  },
  {
    id: "app-4",
    patient: { user: { firstName: "Omar", lastName: "Farooq" } },
    phone: "+1 (555) 332-9871",
    requestedDate: "2026-07-05",
    startTime: "10:00",
    endTime: "10:30",
    clinic: { name: "Downtown Clinic" },
    type: "Initial Visit",
    priority: "2",
    status: "cancelled",
  },
  {
    id: "app-5",
    patient: { user: { firstName: "Emma", lastName: "Watson" } },
    phone: "+1 (555) 654-7890",
    requestedDate: "2026-07-06",
    startTime: "14:00",
    endTime: "14:30",
    clinic: { name: "Bayview Clinic" },
    type: "Follow-up",
    priority: "1",
    status: "no_show",
  },
  {
    id: "app-6",
    patient: { user: { firstName: "Michael", lastName: "Chen" } },
    phone: "+1 (555) 987-6543",
    requestedDate: "2026-07-07",
    startTime: "15:30",
    endTime: "16:00",
    clinic: { name: "Downtown Clinic" },
    type: "Consultation",
    priority: "2",
    status: "completed",
  },
  {
    id: "app-7",
    patient: { user: { firstName: "Nour", lastName: "El-Din" } },
    phone: "+1 (555) 123-4567",
    requestedDate: "2026-07-08",
    startTime: "09:30",
    endTime: "10:00",
    clinic: { name: "Bayview Clinic" },
    type: "Initial Visit",
    priority: "1",
    status: "confirmed",
  },
  {
    id: "app-8",
    patient: { user: { firstName: "James", lastName: "Miller" } },
    phone: "+1 (555) 456-7890",
    requestedDate: "2026-07-09",
    startTime: "11:30",
    endTime: "12:00",
    clinic: { name: "Downtown Clinic" },
    type: "Return Visit",
    priority: "2",
    status: "pending",
  }
];

const appointmentColumns = [
  {
    accessorFn: (appointment) => getPatientDisplayName(appointment),
    id: "patient",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20 shrink-0">
          {getPatientDisplayName(row.original).charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 text-sm tracking-tight">
            {getPatientDisplayName(row.original)}
          </span>
          <span className="text-xs text-[#1e61dc] font-medium">
            {row.original.phone ?? "No phone provided"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "requestedDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-medium text-[#1e61dc] text-xs bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 inline-block shadow-sm">
        {formatAppointmentDate(row.original.requestedDate)}
      </span>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Time Slot",
    cell: ({ row }) => (
      <span className="font-medium text-slate-700 text-xs bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60 inline-block shadow-sm">
        {formatAppointmentTimeRange(row.original)}
      </span>
    ),
  },
  {
    accessorFn: (appointment) => getClinicName(appointment),
    id: "clinic",
    header: "Clinic",
    cell: ({ row }) => (
      <span className="font-medium text-[#1e61dc] text-xs bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 inline-block shadow-sm">
        {getClinicName(row.original)}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] text-white shadow-md shadow-blue-500/20 inline-block">
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <AppointmentPriorityBadge priority={row.original.priority} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
  },
];

export default function DoctorAppointments() {
  const [status, setStatus] = useState("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [isTableView, setIsTableView] = useState(false);
  
  const appointments = useMemo(() => getAllTestDoctorAppointments(), []);

  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    return { total, confirmed, pending, completed };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStatus = status === "all" || appointment.status === status;
      const patientName = getPatientDisplayName(appointment).toLowerCase();
      const phone = (appointment.phone ?? "").toLowerCase();
      const clinic = getClinicName(appointment).toLowerCase();
      const search = globalFilter.toLowerCase();

      return (
        matchesStatus &&
        (patientName.includes(search) || phone.includes(search) || clinic.includes(search))
      );
    });
  }, [appointments, status, globalFilter]);

  const currentStatusLabel = APPOINTMENT_STATUS_OPTIONS.find(opt => opt.value === status)?.label || "All statuses";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/50 text-slate-800 font-sans antialiased flex flex-col selection:bg-[#1e61dc] selection:text-white">
      <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1700px] w-full mx-auto flex-1">
        
        {/* Hero Banner باستخدام التدرج اللوني الجديد */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-5 py-3.5 sm:px-6 sm:py-4 rounded-[20px] text-white shadow-md shadow-blue-500/10 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-0.5 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-semibold tracking-wide border border-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              TABIBI CLINICAL SUITE
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Appointments Control Center
            </h1>
            <p className="text-[11px] text-blue-100 font-normal leading-snug">
              Manage patient flows, track schedules effortlessly, and switch between interactive cards and master tables smoothly.
            </p>
          </div>

          {/* Minimalist Compact Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10 w-full xl:w-auto shrink-0">
            <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/25 text-center shadow-xs flex flex-col justify-center min-w-[85px]">
              <span className="block text-[8px] font-medium text-blue-100 uppercase tracking-wider">Total</span>
              <span className="text-sm font-bold text-white block">{stats.total}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/25 text-center shadow-xs flex flex-col justify-center min-w-[85px]">
              <span className="block text-[8px] font-medium text-blue-100 uppercase tracking-wider">Confirmed</span>
              <span className="text-sm font-bold text-white block">{stats.confirmed}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/25 text-center shadow-xs flex flex-col justify-center min-w-[85px]">
              <span className="block text-[8px] font-medium text-blue-100 uppercase tracking-wider">Pending</span>
              <span className="text-sm font-bold text-white block">{stats.pending}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/25 text-center shadow-xs flex flex-col justify-center min-w-[85px]">
              <span className="block text-[8px] font-medium text-blue-100 uppercase tracking-wider">Completed</span>
              <span className="text-sm font-bold text-white block">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="relative z-[100] bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-[24px] border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:max-w-md relative">
            <Input
              className="w-full bg-slate-50 border-slate-200 focus:border-[#1e61dc] focus:ring-2 focus:ring-[#1e61dc]/20 rounded-xl text-xs sm:text-sm py-3 px-4 text-slate-800 placeholder:text-slate-400 font-medium transition-all"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="🔍 Search patient name, clinic or phone..."
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <Dropdown
              width="w-56"
              align="right"
              trigger={
                <div className="w-full sm:w-56 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm py-3 px-4 text-slate-700 font-semibold flex items-center justify-between transition-all shadow-sm">
                  <span>{currentStatusLabel}</span>
                  <svg className="w-4 h-4 text-slate-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              }
            >
              {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    status === option.value
                      ? "bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{option.label}</span>
                  {status === option.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </button>
              ))}
            </Dropdown>
          </div>
        </div>

        {/* View Switcher Section */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {isTableView ? "Master Table View" : "Interactive Cards Stream"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Showing {filteredAppointments.length} matching appointments</p>
            </div>
            
            {/* Segmented Switcher Button */}
            <div className="inline-flex p-1 bg-slate-200/70 backdrop-blur-md rounded-xl border border-slate-300/60 shadow-inner">
              <button
                onClick={() => setIsTableView(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  !isTableView
                    ? "bg-white text-[#1e61dc] shadow-md shadow-slate-300/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🎴 Cards</span>
              </button>
              <button
                onClick={() => setIsTableView(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isTableView
                    ? "bg-white text-[#1e61dc] shadow-md shadow-slate-300/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>📊 Table</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          {isTableView ? (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/80 shadow-lg shadow-slate-200/40">
              <DataTable
                columns={appointmentColumns}
                data={filteredAppointments}
                emptyMessage="No appointments found matching your criteria."
              />
            </div>
          ) : (
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="flex overflow-x-auto pb-6 pt-2 px-1 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment, index) => (
                    <div
                      key={appointment.id || index}
                      className="snap-start shrink-0 w-[310px] sm:w-[325px] group bg-white/95 backdrop-blur-md p-5 rounded-[24px] border border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      {/* Top Accent Pill */}
                      <div className="absolute top-3.5 right-5 w-10 h-1.5 bg-blue-200/60 rounded-full group-hover:bg-[#3b9df5] group-hover:w-14 transition-all duration-300"></div>

                      {/* Header of Card */}
                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            {getPatientDisplayName(appointment).charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight group-hover:text-[#1e61dc] transition-colors">
                              {getPatientDisplayName(appointment)}
                            </h3>
                            <p className="text-[11px] text-[#1e61dc] font-medium mt-0.5">
                              {appointment.phone ?? "No phone provided"}
                            </p>
                          </div>
                        </div>
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>

                      {/* Details Box */}
                      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium text-[11px]">Requested Date</span>
                          <span className="font-semibold text-[#1e61dc] bg-white px-2 py-0.5 rounded-lg border border-blue-100 shadow-xs text-[11px]">
                            {formatAppointmentDate(appointment.requestedDate)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                          <span className="text-slate-400 font-medium text-[11px]">Time Window</span>
                          <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-xs text-[11px]">
                            {formatAppointmentTimeRange(appointment)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                          <span className="text-slate-400 font-medium text-[11px]">Assigned Clinic</span>
                          <span className="font-semibold text-[#1e61dc] bg-white px-2 py-0.5 rounded-lg border border-blue-100 shadow-xs text-[11px]">
                            {getClinicName(appointment)}
                          </span>
                        </div>
                      </div>

                      {/* Footer of Card */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] text-white shadow-xs shadow-blue-500/20">
                          {appointment.type}
                        </span>
                        <AppointmentPriorityBadge priority={appointment.priority} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-20 text-center bg-white/90 rounded-[28px] border border-slate-200 text-slate-400 font-medium shadow-sm">
                    No appointments found matching your search criteria.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}