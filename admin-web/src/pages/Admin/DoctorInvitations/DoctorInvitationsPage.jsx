import { useEffect, useMemo, useState } from "react";
import { MailPlus, X } from "lucide-react";

import { doctorInvitationsApi } from "@/api/doctorInvitationsApi";
import DataTable from "@/components/shared/DataTable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import DoctorInviteDialog from "../Doctors/components/DoctorInviteDialog";

const STATUS_STYLES = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  EXPIRED: "border-slate-200 bg-slate-100 text-slate-600",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
};

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

function getEffectiveStatus(invitation) {
  if (invitation.status === "PENDING" && new Date(invitation.expiresAt).getTime() <= Date.now()) {
    return "EXPIRED";
  }

  return invitation.status || "PENDING";
}

function formatStatus(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getInvitationColumns({ cancellingInvitationId, onCancel }) {
  return [
    {
      accessorKey: "email",
      header: "Doctor email",
      cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.email}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessorFn: getEffectiveStatus,
      cell: ({ row }) => {
        const status = getEffectiveStatus(row.original);

        return (
          <Badge variant="outline" className={STATUS_STYLES[status] || STATUS_STYLES.PENDING}>
            {formatStatus(status)}
          </Badge>
        );
      },
    },
    {
      id: "createdAt",
      header: "Sent",
      accessorFn: (invitation) => invitation.createdAt || "",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "expiresAt",
      header: "Expires",
      accessorFn: (invitation) => invitation.expiresAt || "",
      cell: ({ row }) => formatDate(row.original.expiresAt),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const invitation = row.original;
        const canCancel = getEffectiveStatus(invitation) === "PENDING";

        return canCancel ? (
          <Button
            variant="outline"
            size="sm"
            disabled={cancellingInvitationId === invitation.id}
            onClick={() => onCancel(invitation)}
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        ) : <span className="text-sm text-slate-400">—</span>;
      },
    },
  ];
}

export default function DoctorInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState(null);
  const [cancellingInvitationId, setCancellingInvitationId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadInvitations() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await doctorInvitationsApi.list();
        if (isCurrent) setInvitations(data);
      } catch (error) {
        if (isCurrent) setLoadError(getErrorMessage(error, "We could not load doctor invitations."));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadInvitations();
    return () => { isCurrent = false; };
  }, [loadAttempt]);

  const columns = useMemo(
    () => getInvitationColumns({
      cancellingInvitationId,
      onCancel: setInvitationToCancel,
    }),
    [cancellingInvitationId],
  );

  const statusCounts = useMemo(() => invitations.reduce((counts, invitation) => {
    const status = getEffectiveStatus(invitation);
    counts.ALL += 1;
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, { ALL: 0 }), [invitations]);

  const filteredInvitations = useMemo(
    () => statusFilter === "ALL"
      ? invitations
      : invitations.filter((invitation) => getEffectiveStatus(invitation) === statusFilter),
    [invitations, statusFilter],
  );

  function retryLoad() {
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function cancelInvitation() {
    if (!invitationToCancel) return;

    setCancellingInvitationId(invitationToCancel.id);
    setActionError("");
    try {
      await doctorInvitationsApi.cancel(invitationToCancel.id);
      setInvitations((current) => current.map((invitation) => (
        String(invitation.id) === String(invitationToCancel.id)
          ? { ...invitation, status: "CANCELLED" }
          : invitation
      )));
      setInvitationToCancel(null);
    } catch (error) {
      setActionError(getErrorMessage(error, "We could not cancel this invitation."));
    } finally {
      setCancellingInvitationId(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Doctor invitations</h1>
          <p className="mt-1 text-sm text-slate-600">Track invitations sent to doctors and cancel pending ones when needed.</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <MailPlus className="h-4 w-4" />
          Invite doctor
        </Button>
      </div>

      {actionError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{actionError}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Invitation status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${statusFilter === filter.value ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              {filter.label}
              <span className={`ml-1.5 text-xs ${statusFilter === filter.value ? "text-slate-300" : "text-slate-400"}`}>
                {statusCounts[filter.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredInvitations}
        emptyMessage={
          isLoading
            ? "Loading doctor invitations…"
            : loadError
              ? "Doctor invitations could not be loaded."
              : statusFilter === "ALL"
                ? "No doctor invitations have been sent yet."
                : `No ${formatStatus(statusFilter).toLowerCase()} invitations found.`
        }
      />

      {loadError && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={retryLoad}>Try again</Button>
        </div>
      )}

      <DoctorInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvitationSent={retryLoad}
      />

      <AlertDialog open={Boolean(invitationToCancel)} onOpenChange={(open) => { if (!open && !cancellingInvitationId) setInvitationToCancel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              The invitation sent to {invitationToCancel?.email} will no longer be usable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <p className="px-5 text-sm text-red-600">{actionError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(cancellingInvitationId)}>Keep invitation</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={Boolean(cancellingInvitationId)} onClick={(event) => { event.preventDefault(); cancelInvitation(); }}>
              {cancellingInvitationId ? "Cancelling…" : "Cancel invitation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
