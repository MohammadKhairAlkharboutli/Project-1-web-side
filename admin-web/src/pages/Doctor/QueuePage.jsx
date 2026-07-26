import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  ListOrdered,
  Stethoscope,
  UserCheck,
  UserX,
} from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import AppointmentPriorityBadge from "@/components/shared/Appointments/AppointmentPriorityBadge";
import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { mockQueueItems } from "../Admin/Queue/mockQueueData";

function QueueStatusBadge({ status }) {
  switch (status) {
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
          <Activity size={13} className="animate-pulse" /> In Progress
        </span>
      );
    case "calling":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
          <Bell size={13} className="animate-bounce" /> Calling
        </span>
      );
    case "waiting":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
          <Clock size={12} /> Waiting
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    case "skipped":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
          <UserX size={12} /> Skipped
        </span>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function DoctorQueuePage() {
  const navigate = useNavigate();

  const queueItems = mockQueueItems;
  const [statusFilter, setStatusFilter] = useState("all");

  // Derived stats (read-only)
  const inProgressPatient = queueItems.find((item) => item.status === "in_progress");
  const waitingCount = queueItems.filter(
    (item) => item.status === "waiting" || item.status === "calling"
  ).length;
  const completedCount = queueItems.filter((item) => item.status === "completed").length;
  const skippedCount = queueItems.filter((item) => item.status === "skipped").length;

  const handleStartConsultation = (queueItem) => {
    const appointmentId = queueItem.appointmentId || queueItem.appointment?.id;
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return queueItems;
    return queueItems.filter((item) => item.status === statusFilter);
  }, [queueItems, statusFilter]);

  const queueColumns = [
    {
      accessorKey: "position",
      header: "Pos",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
            #{row.original.position}
          </span>
          {row.original.status === "in_progress" && (
            <Badge className="bg-emerald-600 text-[10px] px-1.5">CURRENT</Badge>
          )}
          {row.original.status === "calling" && (
            <Badge className="bg-amber-600 text-[10px] px-1.5">CALLING</Badge>
          )}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.appointment?.patient?.user?.full_name,
      id: "patient",
      header: "Patient",
      cell: ({ row }) => {
        const patientUser = row.original.appointment?.patient?.user;
        return (
          <div>
            <p className="font-semibold text-slate-900">
              {patientUser?.full_name || "Unknown Patient"}
            </p>
            <p className="text-xs text-slate-500">
              {patientUser?.phone || "No phone"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "appointment.type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-700">
          {row.original.appointment?.type || "Consultation"}
        </span>
      ),
    },
    {
      accessorKey: "appointment.priority",
      header: "Priority",
      cell: ({ row }) => (
        <AppointmentPriorityBadge priority={row.original.appointment?.priority} />
      ),
    },
    {
      accessorKey: "estimatedWaitMinutes",
      header: "Est. Wait",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.estimatedWaitMinutes} min
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <QueueStatusBadge status={row.original.status} />,
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const item = row.original;
        const canStart =
          item.status === "waiting" ||
          item.status === "calling" ||
          item.status === "in_progress";

        if (!canStart) {
          return <span className="text-xs text-slate-400 italic">—</span>;
        }

        return (
          <Button
            size="sm"
            onClick={() => handleStartConsultation(item)}
            className="gap-1.5 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
          >
            <Stethoscope size={14} />
            Start Consultation
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ListOrdered className="text-[var(--color-primary)]" size={22} />
          Today's Patient Queue
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Patients checked in by the clinic secretary. Start consultations directly from this list.
        </p>
      </div>

      {/* Read-only Summary Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={profileCardShell}>
          <div className="flex items-center justify-between">
            <div>
              <p className={profileCardLabel}>In Room Now</p>
              <p className="text-sm font-bold text-emerald-700 mt-1 truncate max-w-44">
                {inProgressPatient
                  ? inProgressPatient.appointment?.patient?.user?.full_name
                  : "None"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Activity size={20} />
            </div>
          </div>
        </div>

        <div className={profileCardShell}>
          <div className="flex items-center justify-between">
            <div>
              <p className={profileCardLabel}>Still Waiting</p>
              <p className={profileCardValue}>{waitingCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className={profileCardShell}>
          <div className="flex items-center justify-between">
            <div>
              <p className={profileCardLabel}>Completed Today</p>
              <p className={profileCardValue}>{completedCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <UserCheck size={20} />
            </div>
          </div>
        </div>

        <div className={profileCardShell}>
          <div className="flex items-center justify-between">
            <div>
              <p className={profileCardLabel}>Skipped</p>
              <p className={profileCardValue}>{skippedCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <UserX size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Queue Table */}
      <DataTable
        columns={queueColumns}
        data={filteredItems}
        emptyMessage="No patients in the queue yet."
        toolbar={({ globalFilter, setGlobalFilter }) => (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              className="w-full bg-white sm:max-w-xs"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by patient name..."
            />
            <NativeSelect
              className="w-full bg-white sm:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter queue status"
            >
              <NativeSelectOption value="all">All Statuses</NativeSelectOption>
              <NativeSelectOption value="in_progress">In Progress</NativeSelectOption>
              <NativeSelectOption value="calling">Calling</NativeSelectOption>
              <NativeSelectOption value="waiting">Waiting</NativeSelectOption>
              <NativeSelectOption value="completed">Completed</NativeSelectOption>
              <NativeSelectOption value="skipped">Skipped</NativeSelectOption>
            </NativeSelect>
          </div>
        )}
      />
    </div>
  );
}
